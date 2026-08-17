import { createApi } from '@reduxjs/toolkit/query/react'

import { axiosBaseQuery } from '@/lib/axiosBaseQuery'
import { userServiceClient } from '@/lib/axios'

export type PillarType = 'IBBI' | 'NCLT' | 'NCLAT' | 'MCA' | 'NESL'

export interface PillarLinkResponse {
  id: string
  pillarType: PillarType
  externalUsername: string
  linkedAt: string
}

export interface InitiatePillarLinkResponse {
  linkRequestId: string
  authorizationUrl: string
}

export const pillarLinksApi = createApi({
  reducerPath: 'pillarLinksApi',
  baseQuery: axiosBaseQuery(userServiceClient),
  tagTypes: ['PillarLink'],
  endpoints: (builder) => ({
    getMyPillarLinks: builder.query<PillarLinkResponse[], void>({
      query: () => ({ url: '/api/v1/pillar-links', method: 'GET' }),
      providesTags: ['PillarLink'],
    }),
    // Admin-facing: any user's linked pillar accounts (USER_READ) - see UsersPage's
    // expandable row, not the self-service getMyPillarLinks above.
    getPillarLinksForUser: builder.query<PillarLinkResponse[], string>({
      query: (userId) => ({ url: `/api/v1/pillar-links/${userId}`, method: 'GET' }),
      providesTags: (_result, _error, userId) => [{ type: 'PillarLink', id: userId }],
    }),
    initiatePillarLink: builder.mutation<InitiatePillarLinkResponse, PillarType>({
      query: (pillarType) => ({
        url: '/api/v1/pillar-links/initiate',
        method: 'POST',
        data: { pillarType },
      }),
    }),
  }),
})

export const { useGetMyPillarLinksQuery, useGetPillarLinksForUserQuery, useInitiatePillarLinkMutation } =
  pillarLinksApi
