import { createApi } from '@reduxjs/toolkit/query/react'

import { axiosBaseQuery } from '@/lib/axiosBaseQuery'
import { communicationServiceClient } from '@/lib/axios'

export interface NotificationLogResponse {
  id: string
  purpose: string
  recipient: string
  subject: string
  body: string | null
  status: string
  channel: string
  sentAt: string
}

export interface CursorPage<T> {
  content: T[]
  nextCursor: string | null
  hasMore: boolean
}

export const notificationsApi = createApi({
  reducerPath: 'notificationsApi',
  baseQuery: axiosBaseQuery(communicationServiceClient),
  endpoints: (builder) => ({
    // cursor is undefined for the first page; every subsequent page passes the previous
    // response's own nextCursor back verbatim (see CursorPageRequest/Cursor, ipie-common-libs) -
    // this is keyset ("seek") pagination, not offset, so it stays fast no matter how deep a
    // caller pages into what is expected to be a large, high-traffic table.
    listNotifications: builder.query<CursorPage<NotificationLogResponse>, { cursor?: string; size?: number }>({
      query: ({ cursor, size = 20 }) => ({
        url: '/api/v1/notifications',
        method: 'GET',
        params: { cursor, size },
      }),
    }),
  }),
})

export const { useListNotificationsQuery } = notificationsApi
