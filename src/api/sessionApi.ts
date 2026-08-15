import { createApi } from '@reduxjs/toolkit/query/react'

import { axiosBaseQuery } from '@/lib/axiosBaseQuery'
import { userServiceClient } from '@/lib/axios'

// Mirrors common-session's SessionStatus record (ipie-common-libs/common-session) - the backend
// is the source of truth for the idle timeout, not this client; this UI only reacts to it.
export interface SessionStatus {
  active: boolean
  remainingSeconds: number
  warningThresholdSeconds: number
}

export const sessionApi = createApi({
  reducerPath: 'sessionApi',
  baseQuery: axiosBaseQuery(userServiceClient),
  endpoints: (builder) => ({
    sessionStatus: builder.query<SessionStatus, void>({
      query: () => ({ url: '/api/v1/session/status', method: 'GET' }),
    }),
    extendSession: builder.mutation<SessionStatus, void>({
      query: () => ({ url: '/api/v1/session/extend', method: 'POST' }),
    }),
    endSession: builder.mutation<void, void>({
      query: () => ({ url: '/api/v1/session/logout', method: 'POST' }),
    }),
  }),
})

export const { useSessionStatusQuery, useExtendSessionMutation, useEndSessionMutation } = sessionApi
