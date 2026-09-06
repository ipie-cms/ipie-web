import { createApi } from '@reduxjs/toolkit/query/react'

import { axiosBaseQuery } from '@/lib/axiosBaseQuery'
import { userServiceClient } from '@/lib/axios'

export interface UserResponse {
  id: string
  /**
   * The user's Keycloak subject, which role assignment/revocation needs alongside `id` (see
   * `UserRoleArgs`). Null until the user completes registration - a user in that state has no
   * Keycloak account yet and so cannot hold a role.
   */
  keycloakUserId: string | null
  username: string
  email: string
  status: 'ACTIVE' | 'INACTIVE'
}

export interface PageResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export interface SearchUsersParams {
  username?: string
  email?: string
  status?: UserResponse['status']
  page?: number
  size?: number
}

export const usersApi = createApi({
  reducerPath: 'usersApi',
  baseQuery: axiosBaseQuery(userServiceClient),
  endpoints: (builder) => ({
    searchUsers: builder.query<PageResponse<UserResponse>, SearchUsersParams | void>({
      query: (params) => ({
        url: '/api/v1/users',
        method: 'GET',
        params: params ?? undefined,
      }),
    }),
  }),
})

export const { useSearchUsersQuery } = usersApi
