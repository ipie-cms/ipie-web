import { afterEach, describe, expect, it } from 'vitest'

import {
  clearStoredAuth,
  loadStoredAuth,
  saveStoredAuth,
  STORAGE_KEY,
  type StoredAuth,
} from '@/lib/authStorage'
import { TEST_ACCESS_TOKEN, TEST_CLIENT_ID, TEST_REFRESH_TOKEN, TEST_USERNAME } from '@/test/authFixtures'

const auth: StoredAuth = {
  accessToken: TEST_ACCESS_TOKEN,
  refreshToken: TEST_REFRESH_TOKEN,
  username: TEST_USERNAME,
  clientId: TEST_CLIENT_ID,
}

describe('authStorage', () => {
  afterEach(() => {
    localStorage.clear()
  })

  it('returns null when nothing has been stored', () => {
    expect(loadStoredAuth()).toBeNull()
  })

  it('round-trips a saved value', () => {
    saveStoredAuth(auth)

    expect(loadStoredAuth()).toEqual(auth)
  })

  it('returns null instead of throwing when the stored value is not valid JSON', () => {
    localStorage.setItem(STORAGE_KEY, 'not-json-{{{')

    expect(loadStoredAuth()).toBeNull()
  })

  it('removes the stored value on clear', () => {
    saveStoredAuth(auth)

    clearStoredAuth()

    expect(loadStoredAuth()).toBeNull()
  })
})
