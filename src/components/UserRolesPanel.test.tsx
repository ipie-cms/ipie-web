import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { UserRolesPanel } from '@/components/UserRolesPanel'
import type { RoleResponse } from '@/api/rolesApi'

const mockUseGetRolesForUserQuery = vi.fn()
const mockUseListRolesQuery = vi.fn()
const mockAssignRole = vi.fn()
const mockRevokeRole = vi.fn()
const mockAssignState = vi.fn()
const mockRevokeState = vi.fn()
const mockUsePermissions = vi.fn()

// The panel reads the caller's own permissions to mirror iam's delegation ceiling. Mocked rather
// than wrapped in a store, matching how this file already isolates the API hooks.
vi.mock('@/hooks/usePermissions', () => ({
  usePermissions: () => mockUsePermissions(),
}))

vi.mock('@/api/rolesApi', () => ({
  useGetRolesForUserQuery: () => mockUseGetRolesForUserQuery(),
  useListRolesQuery: () => mockUseListRolesQuery(),
  useAssignRoleMutation: () => [mockAssignRole, mockAssignState()],
  useRevokeRoleMutation: () => [mockRevokeRole, mockRevokeState()],
}))

const USER_ID = '11111111-1111-4111-8111-111111111111'
const KEYCLOAK_USER_ID = '22222222-2222-4222-8222-222222222222'

const CASE_VIEWER: RoleResponse = {
  id: 'role-1',
  name: 'CASE_VIEWER',
  description: 'Read-only case access',
  permissionNames: ['CASE_VIEW', 'DOCUMENT_VIEW'],
}

const RESOLUTION_PROFESSIONAL: RoleResponse = {
  id: 'role-2',
  name: 'RESOLUTION_PROFESSIONAL',
  description: null,
  // Deliberately overlaps CASE_VIEWER - the panel must present the union, not a running total.
  permissionNames: ['CASE_VIEW', 'FILING_SUBMIT'],
}

function renderPanel(keycloakUserId: string | null = KEYCLOAK_USER_ID) {
  render(<UserRolesPanel userId={USER_ID} keycloakUserId={keycloakUserId} />)
}

const IDLE = { isLoading: false, error: undefined, reset: vi.fn() }

describe('UserRolesPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseGetRolesForUserQuery.mockReturnValue({
      data: [CASE_VIEWER],
      isLoading: false,
      isError: false,
    })
    mockUseListRolesQuery.mockReturnValue({ data: [CASE_VIEWER, RESOLUTION_PROFESSIONAL] })
    mockAssignState.mockReturnValue(IDLE)
    mockRevokeState.mockReturnValue(IDLE)
    mockAssignRole.mockResolvedValue({ data: undefined })
    mockRevokeRole.mockResolvedValue({ data: undefined })
    // A caller holding everything the fixtures grant, so the ceiling filter is out of the way of
    // every test that is not about it.
    mockUsePermissions.mockReturnValue(['CASE_VIEW', 'DOCUMENT_VIEW', 'FILING_SUBMIT'])
  })

  it('shows a loading indicator while the roles are in flight', () => {
    mockUseGetRolesForUserQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    })

    renderPanel()

    expect(screen.getByText(/loading roles/i)).toBeInTheDocument()
  })

  it('shows an error message when the roles fail to load', () => {
    mockUseGetRolesForUserQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    })

    renderPanel()

    expect(screen.getByText(/failed to load roles/i)).toBeInTheDocument()
  })

  it('explains why a user without a Keycloak account cannot hold a role', () => {
    renderPanel(null)

    expect(screen.getByText(/once this user completes registration/i)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /assign role/i })).not.toBeInTheDocument()
  })

  it('lists the roles the user holds', () => {
    renderPanel()

    expect(screen.getByText('CASE_VIEWER')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Revoke' })).toBeInTheDocument()
  })

  it('reports the union of the held roles permissions, not the sum', () => {
    mockUseGetRolesForUserQuery.mockReturnValue({
      data: [CASE_VIEWER, RESOLUTION_PROFESSIONAL],
      isLoading: false,
      isError: false,
    })

    renderPanel()

    // CASE_VIEW appears in both roles; four names in total, three distinct.
    expect(screen.getByText(/effective permissions \(3\)/i)).toBeInTheDocument()
  })

  it('offers only the roles the user does not already hold', () => {
    mockUseListRolesQuery.mockReturnValue({ data: [CASE_VIEWER] })

    renderPanel()

    expect(screen.getByRole('button', { name: /all roles assigned/i })).toBeDisabled()
  })

  it('does not offer a role granting a permission the caller does not hold', () => {
    // The escalation the ceiling closed: ROLES_MANAGE let any holder assign any role, SUPER_ADMIN
    // included. The server refuses it with 403; this stops the UI offering it in the first place.
    mockUsePermissions.mockReturnValue(['CASE_VIEW', 'DOCUMENT_VIEW'])

    renderPanel()

    expect(screen.getByRole('button', { name: /all roles assigned/i })).toBeDisabled()
  })

  it('requires a reason before a revocation can be submitted', async () => {
    const user = userEvent.setup()
    renderPanel()

    await user.click(screen.getByRole('button', { name: 'Revoke' }))

    const confirm = screen.getByRole('button', { name: 'Revoke' })
    expect(confirm).toBeDisabled()

    await user.type(screen.getByLabelText('Reason'), 'Left the panel')
    expect(confirm).toBeEnabled()

    await user.click(confirm)

    expect(mockRevokeRole).toHaveBeenCalledWith({
      userId: USER_ID,
      keycloakUserId: KEYCLOAK_USER_ID,
      roleName: 'CASE_VIEWER',
      comment: 'Left the panel',
    })
  })

  it("surfaces the server's message when a revocation fails", async () => {
    const user = userEvent.setup()
    mockRevokeState.mockReturnValue({
      isLoading: false,
      error: {
        status: 404,
        data: { errorCode: 'ROLE_NOT_FOUND', message: 'Role no longer exists' },
      },
      reset: vi.fn(),
    })
    renderPanel()

    await user.click(screen.getByRole('button', { name: 'Revoke' }))

    expect(screen.getByText(/role no longer exists/i)).toBeInTheDocument()
  })
})
