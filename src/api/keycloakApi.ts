import { createApi } from '@reduxjs/toolkit/query/react'

import { axiosBaseQuery } from '@/lib/axiosBaseQuery'
import { keycloakClient } from '@/lib/axios'
import { getRuntimeConfig } from '@/lib/runtimeConfig'

export interface LoginRequest {
  username: string
  password: string
}

export interface ExchangeCodeRequest {
  code: string
  codeVerifier: string
  redirectUri: string
}

const { keycloakSsoClientId: ssoClientId, keycloakRealm: realm,
        keycloakClientId: clientId, keycloakClientSecret: clientSecret } = getRuntimeConfig()

export interface TokenResponse {
  access_token: string
  refresh_token: string
  expires_in: number
  token_type: string
}


export const keycloakApi = createApi({
  reducerPath: 'keycloakApi',
  baseQuery: axiosBaseQuery(keycloakClient),
  endpoints: (builder) => ({
    login: builder.mutation<TokenResponse, LoginRequest>({
      query: ({ username, password }) => {
        const body = new URLSearchParams({
          grant_type: 'password',
          client_id: clientId,
          client_secret: clientSecret,
          username,
          password,
          scope: 'openid',
        })

        return {
          url: `/realms/${realm}/protocol/openid-connect/token`,
          method: 'POST',
          data: body,
        }
      },
    }),
    // The other half of the stakeholder-SSO redirect round trip (see LoginPage's
    // redirectToStakeholderLogin) - a public client (no secret), PKCE code_verifier proves
    // possession of the same browser session that started the redirect.
    exchangeCodeForToken: builder.mutation<TokenResponse, ExchangeCodeRequest>({
      query: ({ code, codeVerifier, redirectUri }) => {
        const body = new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: ssoClientId,
          code,
          redirect_uri: redirectUri,
          code_verifier: codeVerifier,
        })

        return {
          url: `/realms/${realm}/protocol/openid-connect/token`,
          method: 'POST',
          data: body,
        }
      },
    }),
  }),
})

export const { useLoginMutation, useExchangeCodeForTokenMutation } = keycloakApi
