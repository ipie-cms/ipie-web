import { createApi } from '@reduxjs/toolkit/query/react'

import { axiosBaseQuery } from '@/lib/axiosBaseQuery'
import { userServiceClient } from '@/lib/axios'

/** One selectable dropdown option from a database-backed lookup catalogue - see ipie-user-service's LookupJpaEntity Javadoc. */
export interface LookupOption {
  id: string
  code: string
  label: string
}

/**
 * The registration wizard's database-backed dropdown catalogues (Professional Role, Legal
 * Representative Type, Professional Identification Type, Identity Proof Type) - each list comes
 * from ipie-user-service's DB, not a hardcoded frontend array, so a new option shows up here as
 * soon as it's seeded, no redeploy needed.
 */
export const registrationLookupsApi = createApi({
  reducerPath: 'registrationLookupsApi',
  baseQuery: axiosBaseQuery(userServiceClient),
  endpoints: (builder) => ({
    getProfessionalRoles: builder.query<LookupOption[], void>({
      query: () => ({ url: '/api/v1/registrations/professional-roles', method: 'GET' }),
    }),
    getLegalRepresentativeTypes: builder.query<LookupOption[], void>({
      query: () => ({ url: '/api/v1/registrations/legal-representative-types', method: 'GET' }),
    }),
    getProfessionalIdentificationTypes: builder.query<LookupOption[], void>({
      query: () => ({
        url: '/api/v1/registrations/professional-identification-types',
        method: 'GET',
      }),
    }),
    getIdentityProofTypes: builder.query<LookupOption[], void>({
      query: () => ({ url: '/api/v1/registrations/identity-proof-types', method: 'GET' }),
    }),
  }),
})

export const {
  useGetProfessionalRolesQuery,
  useGetLegalRepresentativeTypesQuery,
  useGetProfessionalIdentificationTypesQuery,
  useGetIdentityProofTypesQuery,
} = registrationLookupsApi
