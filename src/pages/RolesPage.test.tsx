import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { RolesPage } from '@/pages/RolesPage'
import type { PermissionResponse, RoleResponse } from '@/api/rolesApi'

const mockUseListRolesQuery = vi.fn()
const mockUseListPermissionsQuery = vi.fn()
const mockCreateRole = vi.fn()
const mockUpdateRole = vi.fn()
const mockDeleteRole = vi.fn()
const mockCreateState = vi.fn()
const mockUpdateState = vi.fn()
const mockDeleteState = vi.fn()

vi.mock('@/api/rolesApi', () => ({
  useListRolesQuery: () => mockUseListRolesQuery(),
  useListPermissionsQuery: () => mockUseListPermissionsQuery(),
  useCreateRoleMutation: () => [mockCreateRole, mockCreateState()],
  useUpdateRoleMutation: () => [mockUpdateRole, mockUpdateState()],
  useDeleteRoleMutation: () => [mockDeleteRole, mockDeleteState()],
}))

const CASE_VIEWER: RoleResponse = {
  id: 'role-1',
  name: 'CASE_VIEWER',
  description: 'Read-only case access',
  permissionNames: ['CASE_VIEW'],
}

const PERMISSIONS: PermissionResponse[] = [
  { id: 'p1', name: 'CASE_VIEW', description: 'View a case', resource: 'CASE' },
  { id: 'p2', name: 'CASE_CREATE', description: 'Open a case', resource: 'CASE' },
  { id: 'p3', name: 'USER_READ', description: 'List users', resource: 'USER' },
]

const IDLE = { isLoading: false, error: undefined }

describe('RolesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseListRolesQuery.mockReturnValue({ data: [CASE_VIEWER], isLoading: false, isError: false })
    mockUseListPermissionsQuery.mockReturnValue({ data: PERMISSIONS })
    mockCreateState.mockReturnValue(IDLE)
    mockUpdateState.mockReturnValue(IDLE)
    mockDeleteState.mockReturnValue(IDLE)
    mockCreateRole.mockResolvedValue({ data: CASE_VIEWER })
    mockUpdateRole.mockResolvedValue({ data: CASE_VIEWER })
    mockDeleteRole.mockResolvedValue({ data: undefined })
  })

  it('shows a loading indicator while roles are in flight', () => {
    mockUseListRolesQuery.mockReturnValue({ data: undefined, isLoading: true, isError: false })

    render(<RolesPage />)

    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it('shows an error message when roles fail to load', () => {
    mockUseListRolesQuery.mockReturnValue({ data: undefined, isLoading: false, isError: true })

    render(<RolesPage />)

    expect(screen.getByText(/failed to load roles/i)).toBeInTheDocument()
  })

  it('shows an empty state when no roles are defined', () => {
    mockUseListRolesQuery.mockReturnValue({ data: [], isLoading: false, isError: false })

    render(<RolesPage />)

    expect(screen.getByText(/no roles defined yet/i)).toBeInTheDocument()
  })

  it('lists each role with its description and permission count', () => {
    render(<RolesPage />)

    expect(screen.getByText('CASE_VIEWER')).toBeInTheDocument()
    expect(screen.getByText(/Read-only case access — 1 permission$/)).toBeInTheDocument()
  })

  it('creates a role from the selected permissions', async () => {
    const user = userEvent.setup()
    render(<RolesPage />)

    await user.click(screen.getByRole('button', { name: 'New role' }))
    await user.type(screen.getByLabelText('Name'), 'AUDITOR')
    await user.click(screen.getByRole('checkbox', { name: 'CASE_VIEW' }))
    await user.click(screen.getByRole('checkbox', { name: 'USER_READ' }))
    await user.click(screen.getByRole('button', { name: 'Save' }))

    expect(mockCreateRole).toHaveBeenCalledTimes(1)
    expect(mockCreateRole).toHaveBeenCalledWith({
      name: 'AUDITOR',
      description: undefined,
      // Selection order, which is the order they were clicked above.
      permissionNames: ['CASE_VIEW', 'USER_READ'],
    })
  })

  it('refuses to save a role that carries no permissions', async () => {
    const user = userEvent.setup()
    render(<RolesPage />)

    await user.click(screen.getByRole('button', { name: 'New role' }))
    await user.type(screen.getByLabelText('Name'), 'EMPTY')

    // The failure this guards against is silent: such a role looks correct everywhere and grants
    // nothing to everyone holding it.
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
    expect(screen.getByText(/select at least one permission/i)).toBeInTheDocument()
  })

  it('groups the permission catalogue by resource', async () => {
    const user = userEvent.setup()
    render(<RolesPage />)

    await user.click(screen.getByRole('button', { name: 'New role' }))

    const caseGroup = screen.getByRole('group', { name: 'CASE' })
    expect(within(caseGroup).getByRole('checkbox', { name: 'CASE_CREATE' })).toBeInTheDocument()
    expect(within(caseGroup).getByRole('checkbox', { name: 'CASE_VIEW' })).toBeInTheDocument()
    expect(within(caseGroup).queryByRole('checkbox', { name: 'USER_READ' })).not.toBeInTheDocument()
  })

  it('seeds the editor with the role being edited and keeps its name fixed', async () => {
    const user = userEvent.setup()
    render(<RolesPage />)

    await user.click(screen.getByRole('button', { name: 'Edit' }))

    expect(screen.getByLabelText('Name')).toBeDisabled()
    expect(screen.getByRole('checkbox', { name: 'CASE_VIEW' })).toBeChecked()
    expect(screen.getByRole('checkbox', { name: 'USER_READ' })).not.toBeChecked()
  })

  it("surfaces the server's reason when a delete is refused", async () => {
    const user = userEvent.setup()
    mockDeleteState.mockReturnValue({
      isLoading: false,
      error: {
        status: 409,
        data: {
          errorCode: 'ROLE_IN_USE',
          message: "Role 'CASE_VIEWER' is still assigned to one or more users",
        },
      },
    })
    render(<RolesPage />)

    await user.click(screen.getByRole('button', { name: 'Delete' }))

    expect(screen.getByText(/still assigned to one or more users/i)).toBeInTheDocument()
  })
})
