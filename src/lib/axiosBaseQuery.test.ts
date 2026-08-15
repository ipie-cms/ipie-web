import { describe, expect, it, vi } from 'vitest'
import type { AxiosInstance } from 'axios'

import { axiosBaseQuery } from '@/lib/axiosBaseQuery'

function fakeClient(impl: (...args: unknown[]) => unknown) {
  return vi.fn(impl) as unknown as AxiosInstance
}

describe('axiosBaseQuery', () => {
  it('returns the response data on success', async () => {
    const client = fakeClient(() => Promise.resolve({ data: { id: '1' } }))
    const baseQuery = axiosBaseQuery(client)

    const result = await baseQuery({ url: '/api/v1/users' }, {} as never, {})

    expect(result).toEqual({ data: { id: '1' } })
  })

  it('forwards method/params/data/headers to the underlying client', async () => {
    const client = fakeClient(() => Promise.resolve({ data: {} }))
    const baseQuery = axiosBaseQuery(client)

    await baseQuery(
      {
        url: '/api/v1/users',
        method: 'POST',
        data: { username: 'jdoe' },
        params: { size: 5 },
        headers: { 'X-Test': '1' },
      },
      {} as never,
      {},
    )

    expect(client).toHaveBeenCalledWith({
      url: '/api/v1/users',
      method: 'POST',
      data: { username: 'jdoe' },
      params: { size: 5 },
      headers: { 'X-Test': '1' },
    })
  })

  it('maps an HTTP error response to a status/data error shape', async () => {
    const client = fakeClient(() =>
      Promise.reject({ response: { status: 409, data: { errorCode: 'CONFLICT' } } }),
    )
    const baseQuery = axiosBaseQuery(client)

    const result = await baseQuery({ url: '/api/v1/users' }, {} as never, {})

    expect(result).toEqual({ error: { status: 409, data: { errorCode: 'CONFLICT' } } })
  })

  it('falls back to the error message when there is no HTTP response (network error)', async () => {
    const client = fakeClient(() => Promise.reject({ message: 'Network Error' }))
    const baseQuery = axiosBaseQuery(client)

    const result = await baseQuery({ url: '/api/v1/users' }, {} as never, {})

    expect(result).toEqual({ error: { status: undefined, data: 'Network Error' } })
  })
})
