import { createApi } from '@reduxjs/toolkit/query/react'

import { axiosBaseQuery } from '@/lib/axiosBaseQuery'
import { publicIamServiceClient } from '@/lib/axios'

/**
 * Credential operations, which belong to **ipie-iam-service** and not to ipie-user-service.
 *
 * That split is deliberate: iam owns the account and its credentials, user-service owns the person.
 * Posting a password to user-service would put a plaintext credential through a service that has no
 * business holding one, and would add a synchronous cross-service call to a page a user is waiting
 * in front of.
 */
export const credentialApi = createApi({
  reducerPath: 'credentialApi',
  baseQuery: axiosBaseQuery(publicIamServiceClient),
  endpoints: (builder) => ({
    /**
     * Sets the first password on an account that was provisioned without one, authorised by the
     * single-use token from the email the registrant received. Returns no content.
     */
    setInitialPassword: builder.mutation<void, { token: string; password: string }>({
      query: ({ token, password }) => ({
        url: '/api/v1/credentials/password',
        method: 'POST',
        data: { token, password },
      }),
    }),
  }),
})

export const { useSetInitialPasswordMutation } = credentialApi
