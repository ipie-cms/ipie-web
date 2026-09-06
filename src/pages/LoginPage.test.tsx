import { beforeEach, describe, expect, it, vi } from 'vitest'
import { configureStore } from '@reduxjs/toolkit'
import { Provider } from 'react-redux'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import authReducer from '@/features/auth/authSlice'
import { LoginPage } from '@/pages/LoginPage'

const mockNavigate = vi.fn()
const mockLogin = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

vi.mock('@/api/keycloakApi', () => ({
  useLoginMutation: () => [mockLogin, { isLoading: false }],
}))

function renderLoginPage() {
  const store = configureStore({ reducer: { auth: authReducer } })
  render(
    <Provider store={store}>
      <LoginPage />
    </Provider>,
  )
  return store
}

describe('LoginPage', () => {
  beforeEach(() => {
    mockNavigate.mockReset()
    mockLogin.mockReset()
  })

  it('stores credentials and navigates to /dashboard on successful login', async () => {
    mockLogin.mockReturnValue({
      unwrap: () =>
        Promise.resolve({
          access_token: 'access-123',
          refresh_token: 'refresh-123',
          expires_in: 300,
          token_type: 'Bearer',
        }),
    })

    const store = renderLoginPage()
    const user = userEvent.setup()

    await user.type(screen.getByLabelText(/username/i), 'testuser')
    await user.type(screen.getByLabelText('Password', { exact: true }), 'testpass')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(store.getState().auth.accessToken).toBe('access-123')
    })
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true })
  })

  it('shows an error message on invalid credentials', async () => {
    mockLogin.mockReturnValue({
      unwrap: () => Promise.reject({ status: 401, data: { error: 'invalid_grant' } }),
    })

    renderLoginPage()
    const user = userEvent.setup()

    await user.type(screen.getByLabelText(/username/i), 'testuser')
    await user.type(screen.getByLabelText('Password', { exact: true }), 'wrongpass')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    expect(await screen.findByText(/invalid username or password/i)).toBeInTheDocument()
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('shows a network error message when the auth server is unreachable', async () => {
    mockLogin.mockReturnValue({
      unwrap: () => Promise.reject({ status: undefined, data: 'Network Error' }),
    })

    renderLoginPage()
    const user = userEvent.setup()

    await user.type(screen.getByLabelText(/username/i), 'testuser')
    await user.type(screen.getByLabelText('Password', { exact: true }), 'testpass')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    expect(await screen.findByText(/network error/i)).toBeInTheDocument()
    expect(mockNavigate).not.toHaveBeenCalled()
  })
})
