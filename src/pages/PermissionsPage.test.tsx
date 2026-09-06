import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { PermissionsPage } from '@/pages/PermissionsPage'
import type { PermissionResponse } from '@/api/rolesApi'

const mockUseListPermissionsQuery = vi.fn()
const mockCreatePermission = vi.fn()
const mockCreateState = vi.fn()

vi.mock('@/api/rolesApi', () => ({
  useListPermissionsQuery: () => mockUseListPermissionsQuery(),
  useCreatePermissionMutation: () => [mockCreatePermission, mockCreateState()],
}))

const PERMISSIONS: PermissionResponse[] = [
  { id: 'p1', name: 'CASE_VIEW', description: 'View a case', resource: 'CASE' },
  { id: 'p2', name: 'CASE_CREATE', description: 'Open a case', resource: 'CASE' },
  { id: 'p3', name: 'USER_READ', description: 'List users', resource: 'USER' },
]

const IDLE = { isLoading: false, error: undefined }

describe('PermissionsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseListPermissionsQuery.mockReturnValue({
      data: PERMISSIONS,
      isLoading: false,
      isError: false,
    })
    mockCreateState.mockReturnValue(IDLE)
    mockCreatePermission.mockResolvedValue({ data: PERMISSIONS[0] })
  })

  it('shows a loading indicator while the catalogue is in flight', () => {
    mockUseListPermissionsQuery.mockReturnValue({ isLoading: true, isError: false })

    render(<PermissionsPage />)

    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it('shows an error message when the catalogue fails to load', () => {
    mockUseListPermissionsQuery.mockReturnValue({ isLoading: false, isError: true })

    render(<PermissionsPage />)

    expect(screen.getByText(/failed to load permissions/i)).toBeInTheDocument()
  })

  it('shows an empty state when the catalogue has no entries', () => {
    mockUseListPermissionsQuery.mockReturnValue({ data: [], isLoading: false, isError: false })

    render(<PermissionsPage />)

    expect(screen.getByText(/no permissions in the catalogue/i)).toBeInTheDocument()
  })

  it('groups entries by the resource they apply to', () => {
    render(<PermissionsPage />)

    // The grouping is what makes a long catalogue scannable, so it is asserted rather than assumed.
    expect(screen.getByText('CASE')).toBeInTheDocument()
    expect(screen.getByText('USER')).toBeInTheDocument()
    expect(screen.getByText('CASE_VIEW')).toBeInTheDocument()
    expect(screen.getByText('View a case')).toBeInTheDocument()
  })

  it('creates a permission with its name upper-cased', async () => {
    const user = userEvent.setup()
    render(<PermissionsPage />)

    await user.click(screen.getByRole('button', { name: 'New permission' }))
    await user.type(screen.getByLabelText('Name'), 'claims_approve')
    await user.type(screen.getByLabelText('Resource'), 'claims')
    await user.click(screen.getByRole('button', { name: 'Create' }))

    // A permission name is matched literally by @RequiresPermission and by a Keycloak realm role,
    // so the casing is not cosmetic - a lower-case entry would silently never match.
    expect(mockCreatePermission).toHaveBeenCalledWith({
      name: 'CLAIMS_APPROVE',
      resource: 'CLAIMS',
      description: undefined,
    })
  })

  it('refuses to submit a name that is not SCREAMING_SNAKE_CASE', async () => {
    const user = userEvent.setup()
    render(<PermissionsPage />)

    await user.click(screen.getByRole('button', { name: 'New permission' }))
    await user.type(screen.getByLabelText('Name'), 'CLAIMS APPROVE')
    await user.type(screen.getByLabelText('Resource'), 'CLAIMS')

    expect(screen.getByRole('button', { name: 'Create' })).toBeDisabled()
    expect(mockCreatePermission).not.toHaveBeenCalled()
  })
})
