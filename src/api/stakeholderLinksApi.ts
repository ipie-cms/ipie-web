import { createApi } from '@reduxjs/toolkit/query/react'

import { axiosBaseQuery } from '@/lib/axiosBaseQuery'
import { userServiceClient } from '@/lib/axios'

export type StakeholderType = 'IBBI' | 'NCLT' | 'NCLAT' | 'MCA' | 'NESL'

export interface StakeholderLinkResponse {
  id: string
  stakeholderType: StakeholderType
  externalUsername: string
  linkedAt: string
}

export interface InitiateStakeholderLinkResponse {
  linkRequestId: string
  authorizationUrl: string
}

export const stakeholderLinksApi = createApi({
  reducerPath: 'stakeholderLinksApi',
  baseQuery: axiosBaseQuery(userServiceClient),
  tagTypes: ['StakeholderLink'],
  endpoints: (builder) => ({
    getMyStakeholderLinks: builder.query<StakeholderLinkResponse[], void>({
      query: () => ({ url: '/api/v1/stakeholder-links', method: 'GET' }),
      providesTags: ['StakeholderLink'],
    }),
    // Admin-facing: any user's linked stakeholder accounts (USER_READ) - see UsersPage's
    // expandable row, not the self-service getMyStakeholderLinks above.
    getStakeholderLinksForUser: builder.query<StakeholderLinkResponse[], string>({
      query: (userId) => ({ url: `/api/v1/stakeholder-links/${userId}`, method: 'GET' }),
      providesTags: (_result, _error, userId) => [{ type: 'StakeholderLink', id: userId }],
    }),
    initiateStakeholderLink: builder.mutation<InitiateStakeholderLinkResponse, StakeholderType>({
      query: (stakeholderType) => ({
        url: '/api/v1/stakeholder-links/initiate',
        method: 'POST',
        data: { stakeholderType },
      }),
    }),
  }),
})

export const { useGetMyStakeholderLinksQuery, useGetStakeholderLinksForUserQuery, useInitiateStakeholderLinkMutation } =
  stakeholderLinksApi
