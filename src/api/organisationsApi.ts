import { createApi } from '@reduxjs/toolkit/query/react'

import { axiosBaseQuery } from '@/lib/axiosBaseQuery'
import { userServiceClient } from '@/lib/axios'

export type LegalConstitution =
  | 'PUBLIC_LTD_COMPANY'
  | 'PRIVATE_LTD_COMPANY'
  | 'LLP'
  | 'PROPRIETORSHIP'
  | 'PARTNERSHIP'
  | 'ENTITY_CREATED_BY_OR_UNDER_A_STATUTE'
  | 'TRUST'
  | 'HUF'
  | 'CO_OP_SOCIETY'
  | 'ASSOCIATION_OF_PERSONS'
  | 'GOVERNMENT'
  | 'SELF_HELP_GROUP'
  | 'RESIDENT_INDIVIDUAL'
  | 'NON_RESIDENT_FOREIGN_COMPANY'
  | 'OTHER'

export type OrganisationIdType = 'CIN' | 'PAN' | 'LLPIN' | 'TAN' | 'OTHER'

export interface OrganisationResponse {
  id: string
  name: string
  legalConstitution: LegalConstitution
  idType: OrganisationIdType
  idValue: string
  msme: boolean
  msmeType: string | null
  registeredAddress: string | null
  contactNumber: string | null
  contactEmail: string | null
  country: string | null
  state: string | null
  city: string | null
  pin: string | null
  district: string | null
}

interface PageResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

/**
 * Backs the Entity registration wizard's "Search and Select Your Registered Entity" step -
 * deliberately hits ipie-user-service's registration-scoped search endpoint (public, unlike
 * OrganisationController's own ORGANISATION_READ-gated one), since the wizard runs fully
 * unauthenticated.
 */
export const organisationsApi = createApi({
  reducerPath: 'organisationsApi',
  baseQuery: axiosBaseQuery(userServiceClient),
  endpoints: (builder) => ({
    searchOrganisations: builder.query<PageResponse<OrganisationResponse>, { name: string }>({
      query: ({ name }) => ({
        url: '/api/v1/registrations/organisations/search',
        method: 'GET',
        params: { name },
      }),
    }),
  }),
})

export const { useSearchOrganisationsQuery, useLazySearchOrganisationsQuery } = organisationsApi
