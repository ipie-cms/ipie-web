import { createApi } from '@reduxjs/toolkit/query/react'

import { axiosBaseQuery } from '@/lib/axiosBaseQuery'
import { iamServiceClient } from '@/lib/axios'

export interface RoleResponse {
  id: string
  name: string
  description: string | null
  permissionNames: string[]
}

/** An entry in the catalogue a role is composed from. */
export interface PermissionResponse {
  id: string
  name: string
  description: string | null
  /** The ABAC axis the permission applies to - what the role editor groups the catalogue by. */
  resource: string
}

/**
 * `name` and `resource` are SCREAMING_SNAKE_CASE server-side (`CreatePermissionRequest`), because a
 * permission name is matched literally against a `@RequiresPermission` string and a Keycloak realm
 * role. `resource` is the ABAC axis the catalogue is grouped by, and is required.
 */
export interface CreatePermissionArgs {
  name: string
  description?: string
  resource: string
}

export interface CreateRoleArgs {
  name: string
  description?: string
  permissionNames: string[]
}

/** No `name`: a role's name is fixed at creation, because issued JWTs are keyed on it. */
export interface UpdateRoleArgs {
  roleId: string
  description?: string
  permissionNames: string[]
}

/**
 * Both identifiers are required and they are different things: the path is keyed on
 * ipie-user-service's user id, while the body carries the Keycloak subject the realm-role mapping
 * is synced against. `UserResponse` is the only place the pairing is known.
 */
export interface UserRoleArgs {
  userId: string
  keycloakUserId: string
  roleName: string
  comment?: string
}

export const rolesApi = createApi({
  reducerPath: 'rolesApi',
  baseQuery: axiosBaseQuery(iamServiceClient),
  tagTypes: ['Role', 'Permission', 'UserRoles'],
  endpoints: (builder) => ({
    getMyRoles: builder.query<RoleResponse[], void>({
      query: () => ({
        url: '/api/v1/users/me/roles',
        method: 'GET',
      }),
    }),

    listRoles: builder.query<RoleResponse[], void>({
      query: () => ({ url: '/api/v1/roles', method: 'GET' }),
      providesTags: ['Role'],
    }),

    listPermissions: builder.query<PermissionResponse[], void>({
      query: () => ({ url: '/api/v1/permissions', method: 'GET' }),
      providesTags: ['Permission'],
    }),

    createPermission: builder.mutation<PermissionResponse, CreatePermissionArgs>({
      query: (body) => ({ url: '/api/v1/permissions', method: 'POST', data: body }),
      invalidatesTags: ['Permission'],
    }),

    createRole: builder.mutation<RoleResponse, CreateRoleArgs>({
      query: (body) => ({ url: '/api/v1/roles', method: 'POST', data: body }),
      invalidatesTags: ['Role'],
    }),

    updateRole: builder.mutation<RoleResponse, UpdateRoleArgs>({
      query: ({ roleId, ...body }) => ({
        url: `/api/v1/roles/${roleId}`,
        method: 'PUT',
        data: body,
      }),
      // Editing a role's permission set changes what its *holders* can do, so every cached
      // per-user role list is stale too, not just the role list itself.
      invalidatesTags: ['Role', 'UserRoles'],
    }),

    deleteRole: builder.mutation<void, string>({
      query: (roleId) => ({ url: `/api/v1/roles/${roleId}`, method: 'DELETE' }),
      invalidatesTags: ['Role'],
    }),

    getRolesForUser: builder.query<RoleResponse[], string>({
      query: (userId) => ({ url: `/api/v1/users/${userId}/roles`, method: 'GET' }),
      providesTags: (_result, _error, userId) => [{ type: 'UserRoles', id: userId }],
    }),

    assignRole: builder.mutation<void, UserRoleArgs>({
      query: ({ userId, ...body }) => ({
        url: `/api/v1/users/${userId}/roles`,
        method: 'POST',
        data: body,
      }),
      invalidatesTags: (_result, _error, { userId }) => [{ type: 'UserRoles', id: userId }],
    }),

    // A DELETE carrying a body - the role name and Keycloak subject identify *which* assignment
    // to withdraw, and `comment` records why for the audit trail. axiosBaseQuery passes `data`
    // straight through to axios, which sends it on any method.
    revokeRole: builder.mutation<void, UserRoleArgs>({
      query: ({ userId, ...body }) => ({
        url: `/api/v1/users/${userId}/roles`,
        method: 'DELETE',
        data: body,
      }),
      // Also invalidates 'Role': the last revocation of a role is what makes it deletable, and
      // the roles page refuses deletion based on that state.
      invalidatesTags: (_result, _error, { userId }) => [{ type: 'UserRoles', id: userId }, 'Role'],
    }),
  }),
})

export const {
  useGetMyRolesQuery,
  useListRolesQuery,
  useListPermissionsQuery,
  useCreatePermissionMutation,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
  useGetRolesForUserQuery,
  useAssignRoleMutation,
  useRevokeRoleMutation,
} = rolesApi
