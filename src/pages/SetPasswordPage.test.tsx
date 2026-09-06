import { describe, expect, it, vi, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { SetPasswordPage } from '@/pages/SetPasswordPage'

const mockSetInitialPassword = vi.fn()

vi.mock('@/api/credentialApi', async () => {
  const actual = await vi.importActual<typeof import('@/api/credentialApi')>('@/api/credentialApi')
  return {
    ...actual,
    useSetInitialPasswordMutation: () => [mockSetInitialPassword, { isLoading: false }],
  }
})

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <SetPasswordPage />
    </MemoryRouter>,
  )
}

describe('SetPasswordPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSetInitialPassword.mockReturnValue({ unwrap: () => Promise.resolve() })
  })

  it('posts the token from the URL together with the chosen password', async () => {
    renderAt('/set-password?token=tok-abc123')
    const user = userEvent.setup()

    await user.type(screen.getByLabelText('New password'), 'E2eTestPass!23')
    await user.type(screen.getByLabelText('Confirm password'), 'E2eTestPass!23')
    await user.click(screen.getByRole('button', { name: 'Set password' }))

    await waitFor(() =>
      expect(mockSetInitialPassword).toHaveBeenCalledWith({
        token: 'tok-abc123',
        password: 'E2eTestPass!23',
      }),
    )
    expect(await screen.findByText('Password set')).toBeInTheDocument()
  })

  /**
   * The policy is enforced by ipie-iam-service; this only spares the user a round trip. The point of
   * the assertion is that a rejected password is never sent at all.
   */
  it('rejects a password that does not meet the policy without calling the server', async () => {
    renderAt('/set-password?token=tok-abc123')
    const user = userEvent.setup()

    await user.type(screen.getByLabelText('New password'), 'short1!')
    await user.type(screen.getByLabelText('Confirm password'), 'short1!')
    await user.click(screen.getByRole('button', { name: 'Set password' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(/at least 12 characters/i)
    expect(mockSetInitialPassword).not.toHaveBeenCalled()
  })

  it('rejects mismatched passwords without calling the server', async () => {
    renderAt('/set-password?token=tok-abc123')
    const user = userEvent.setup()

    await user.type(screen.getByLabelText('New password'), 'E2eTestPass!23')
    await user.type(screen.getByLabelText('Confirm password'), 'E2eTestPass!99')
    await user.click(screen.getByRole('button', { name: 'Set password' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(/do not match/i)
    expect(mockSetInitialPassword).not.toHaveBeenCalled()
  })

  /**
   * 422 is what iam returns for a link that is unknown, expired, or already used - it deliberately
   * does not say which, so the page must not guess either. What matters is that the user is told to
   * get a new link rather than shown a generic failure they cannot act on.
   */
  it('explains that the link is spent when the server rejects the token', async () => {
    mockSetInitialPassword.mockReturnValue({
      unwrap: () => Promise.reject({ status: 422 }),
    })
    renderAt('/set-password?token=already-used')
    const user = userEvent.setup()

    await user.type(screen.getByLabelText('New password'), 'E2eTestPass!23')
    await user.type(screen.getByLabelText('Confirm password'), 'E2eTestPass!23')
    await user.click(screen.getByRole('button', { name: 'Set password' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(/no longer valid/i)
  })

  it('shows no form at all when the link carries no token', () => {
    renderAt('/set-password')

    expect(screen.getByText('Link not valid')).toBeInTheDocument()
    expect(screen.queryByLabelText('New password')).not.toBeInTheDocument()
  })
})
