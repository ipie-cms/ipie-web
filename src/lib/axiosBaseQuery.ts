import type { BaseQueryFn } from '@reduxjs/toolkit/query'
import type { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios'

type AxiosBaseQueryArgs = {
  url: string
  method?: AxiosRequestConfig['method']
  data?: AxiosRequestConfig['data']
  params?: AxiosRequestConfig['params']
  headers?: AxiosRequestConfig['headers']
}

export function axiosBaseQuery(
  client: AxiosInstance,
): BaseQueryFn<AxiosBaseQueryArgs, unknown, { status?: number; data: unknown }> {
  return async ({ url, method = 'GET', data, params, headers }) => {
    try {
      const result = await client({ url, method, data, params, headers })
      return { data: result.data }
    } catch (err) {
      const axiosError = err as AxiosError
      return {
        error: {
          status: axiosError.response?.status,
          data: axiosError.response?.data ?? axiosError.message,
        },
      }
    }
  }
}
