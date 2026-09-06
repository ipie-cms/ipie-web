import { afterEach, describe, expect, it, vi } from 'vitest'
import type { AxiosError, AxiosInstance } from 'axios'

import { handleAuthedResponseError, refreshAccessTokenAcrossTabs } from '@/lib/axios'
import { saveStoredAuth, clearStoredAuth, type StoredAuth } from '@/lib/authStorage'
import { TEST_ACCESS_TOKEN, TEST_CLIENT_ID, TEST_REFRESH_TOKEN, TEST_USERNAME } from '@/test/authFixtures'

const stored: StoredAuth = {
  accessToken: TEST_ACCESS_TOKEN,
  refreshToken: TEST_REFRESH_TOKEN,
  username: TEST_USERNAME,
  clientId: TEST_CLIENT_ID,
}

const refreshed: StoredAuth = { ...stored, accessToken: 'access-456', refreshToken: 'refresh-456' }

function fakeError(status: number | undefined, retried?: boolean): AxiosError {
  return {
    response: status === undefined ? undefined : { status },
    config: {
      headers: { set: vi.fn() },
      _retried: retried,
    },
  } as unknown as AxiosError
}

function fakeClient(result: unknown = { data: 'retried-ok' }) {
  return vi.fn().mockResolvedValue(result) as unknown as AxiosInstance
}

describe('handleAuthedResponseError', () => {
  afterEach(() => {
    clearStoredAuth()
    vi.restoreAllMocks()
  })

  it('refreshes and retries once on a 401', async () => {
    saveStoredAuth(stored)
    const client = fakeClient({ data: 'retried-ok' })
    const refresh = vi.fn().mockResolvedValue(refreshed)

    const result = await handleAuthedResponseError(client, fakeError(401), refresh)

    expect(refresh).toHaveBeenCalledWith(stored)
    expect(client).toHaveBeenCalledWith(
      expect.objectContaining({ _retried: true }),
    )
    expect(result).toEqual({ data: 'retried-ok' })
  })

  it('sets the refreshed Authorization header on the retried request', async () => {
    saveStoredAuth(stored)
    const client = fakeClient()
    const refresh = vi.fn().mockResolvedValue(refreshed)
    const error = fakeError(401)

    await handleAuthedResponseError(client, error, refresh)

    expect(error.config?.headers.set).toHaveBeenCalledWith('Authorization', `Bearer ${refreshed.accessToken}`)
  })

  it('triggers exactly one refresh call for two concurrent 401s (single-flight)', async () => {
    saveStoredAuth(stored)
    const client = fakeClient()
    let resolveRefresh: (value: StoredAuth) => void = () => {}
    const refresh = vi.fn(() => new Promise<StoredAuth>((resolve) => (resolveRefresh = resolve)))

    const first = handleAuthedResponseError(client, fakeError(401), refresh)
    const second = handleAuthedResponseError(client, fakeError(401), refresh)
    resolveRefresh(refreshed)
    await Promise.all([first, second])

    expect(refresh).toHaveBeenCalledTimes(1)
  })

  it('never retries a 403 - refresh must not run for an authorization failure', async () => {
    saveStoredAuth(stored)
    const client = fakeClient()
    const refresh = vi.fn()
    const error = fakeError(403)

    await expect(handleAuthedResponseError(client, error, refresh)).rejects.toBe(error)

    expect(refresh).not.toHaveBeenCalled()
    expect(client).not.toHaveBeenCalled()
  })

  it('never retries a request that has already been retried once', async () => {
    saveStoredAuth(stored)
    const client = fakeClient()
    const refresh = vi.fn()
    const error = fakeError(401, true)

    await expect(handleAuthedResponseError(client, error, refresh)).rejects.toBe(error)

    expect(refresh).not.toHaveBeenCalled()
  })

  it('rethrows immediately when there is no stored auth to refresh from', async () => {
    const client = fakeClient()
    const refresh = vi.fn()
    const error = fakeError(401)

    await expect(handleAuthedResponseError(client, error, refresh)).rejects.toBe(error)

    expect(refresh).not.toHaveBeenCalled()
  })

  it('clears storage and redirects to /login when the refresh call itself fails', async () => {
    saveStoredAuth(stored)
    const client = fakeClient()
    const refreshError = new Error('refresh token expired')
    const refresh = vi.fn().mockRejectedValue(refreshError)

    // jsdom's window.location.assign isn't configurable, so vi.spyOn can't wrap it directly -
    // replace the whole location object for the duration of this test instead.
    const originalLocation = window.location
    const assignMock = vi.fn()
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { ...originalLocation, assign: assignMock },
    })

    try {
      await expect(handleAuthedResponseError(client, fakeError(401), refresh)).rejects.toThrow(refreshError)

      expect(assignMock).toHaveBeenCalledWith('/login')
      expect(localStorage.getItem('ipie.auth')).toBeNull()
    } finally {
      Object.defineProperty(window, 'location', { configurable: true, value: originalLocation })
    }
  })
})

describe('refreshAccessTokenAcrossTabs', () => {
  const originalLocks = navigator.locks

  afterEach(() => {
    clearStoredAuth()
    vi.restoreAllMocks()
    Object.defineProperty(navigator, 'locks', { configurable: true, value: originalLocks })
  })

  it('falls back to a plain refresh when the Web Locks API is unavailable', async () => {
    Object.defineProperty(navigator, 'locks', { configurable: true, value: undefined })
    const refresh = vi.fn().mockResolvedValue(refreshed)

    const result = await refreshAccessTokenAcrossTabs(stored, refresh)

    expect(refresh).toHaveBeenCalledWith(stored)
    expect(result).toEqual(refreshed)
  })

  it('acquires the cross-tab lock and refreshes when storage still shows the same token', async () => {
    saveStoredAuth(stored)
    Object.defineProperty(navigator, 'locks', {
      configurable: true,
      value: { request: vi.fn((_name: string, callback: () => unknown) => callback()) },
    })
    const refresh = vi.fn().mockResolvedValue(refreshed)

    const result = await refreshAccessTokenAcrossTabs(stored, refresh)

    expect(navigator.locks.request).toHaveBeenCalledWith('ipie-web:token-refresh', expect.any(Function))
    expect(refresh).toHaveBeenCalledWith(stored)
    expect(result).toEqual(refreshed)
  })

  it('skips the network call when another tab already refreshed while this one waited for the lock', async () => {
    const alreadyRefreshedByAnotherTab = { ...refreshed, accessToken: 'access-from-other-tab' }
    saveStoredAuth(alreadyRefreshedByAnotherTab)
    Object.defineProperty(navigator, 'locks', {
      configurable: true,
      value: { request: vi.fn((_name: string, callback: () => unknown) => callback()) },
    })
    const refresh = vi.fn().mockResolvedValue(refreshed)

    const result = await refreshAccessTokenAcrossTabs(stored, refresh)

    expect(refresh).not.toHaveBeenCalled()
    expect(result).toEqual(alreadyRefreshedByAnotherTab)
  })
})
