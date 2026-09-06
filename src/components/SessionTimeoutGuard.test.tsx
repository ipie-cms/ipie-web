import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { configureStore } from '@reduxjs/toolkit'
import { Provider } from 'react-redux'
import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import authReducer, { type AuthState } from '@/features/auth/authSlice'
import { SessionTimeoutGuard } from '@/components/SessionTimeoutGuard'
import type { SessionStatus } from '@/api/sessionApi'
import { AUTHENTICATED_STATE, LOGGED_OUT_STATE } from '@/test/authFixtures'

const mockNavigate = vi.fn()
const mockUseSessionStatusQuery = vi.fn()
const mockExtendSession = vi.fn()
const mockEndSession = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

vi.mock('@/api/sessionApi', () => ({
  useSessionStatusQuery: () => mockUseSessionStatusQuery(),
  useExtendSessionMutation: () => [mockExtendSession],
  useEndSessionMutation: () => [mockEndSession],
}))

function renderGuard(authState: AuthState = AUTHENTICATED_STATE) {
  const store = configureStore({
    reducer: { auth: authReducer },
    preloadedState: { auth: authState },
  })
  render(
    <Provider store={store}>
      <SessionTimeoutGuard />
    </Provider>,
  )
  return store
}

// Shared scenario constants so every test that needs "in the warning window" or "well outside it"
// expresses that intent through a name instead of a bare, easy-to-misread number.
const WARNING_THRESHOLD_SECONDS = 60
const IN_WARNING_WINDOW_SECONDS = 45
const OUTSIDE_WARNING_WINDOW_SECONDS = 500

function status(overrides: Partial<SessionStatus> = {}): SessionStatus {
  return {
    active: true,
    remainingSeconds: WARNING_THRESHOLD_SECONDS,
    warningThresholdSeconds: WARNING_THRESHOLD_SECONDS,
    ...overrides,
  }
}

describe('SessionTimeoutGuard', () => {
  beforeEach(() => {
    mockNavigate.mockReset()
    mockUseSessionStatusQuery.mockReset()
    mockExtendSession.mockReset().mockReturnValue({ unwrap: () => Promise.resolve(status()) })
    mockEndSession.mockReset().mockReturnValue({ unwrap: () => Promise.resolve(undefined) })
  })

  it('renders nothing when there is no access token', () => {
    mockUseSessionStatusQuery.mockReturnValue({ data: undefined })

    renderGuard(LOGGED_OUT_STATE)

    expect(screen.queryByText(/still there/i)).not.toBeInTheDocument()
  })

  it('renders nothing while the session is active and outside the warning window', () => {
    mockUseSessionStatusQuery.mockReturnValue({
      data: status({ remainingSeconds: OUTSIDE_WARNING_WINDOW_SECONDS }),
    })

    renderGuard()

    expect(screen.queryByText(/still there/i)).not.toBeInTheDocument()
  })

  it('shows the "stay logged in?" prompt with the remaining countdown once in the warning window', () => {
    mockUseSessionStatusQuery.mockReturnValue({
      data: status({ remainingSeconds: IN_WARNING_WINDOW_SECONDS }),
    })

    renderGuard()

    expect(screen.getByText(/still there/i)).toBeInTheDocument()
    expect(
      screen.getByText(new RegExp(`${IN_WARNING_WINDOW_SECONDS} seconds`, 'i')),
    ).toBeInTheDocument()
  })

  it('extends the session and dismisses the prompt when "Stay logged in" is clicked', async () => {
    mockUseSessionStatusQuery.mockReturnValue({
      data: status({ remainingSeconds: IN_WARNING_WINDOW_SECONDS }),
    })
    renderGuard()
    const user = userEvent.setup()

    await user.click(screen.getByRole('button', { name: /stay logged in/i }))

    expect(mockExtendSession).toHaveBeenCalled()
    expect(screen.queryByText(/still there/i)).not.toBeInTheDocument()
  })

  it('ends the session and redirects to /login when "Log out" is clicked', async () => {
    mockUseSessionStatusQuery.mockReturnValue({
      data: status({ remainingSeconds: IN_WARNING_WINDOW_SECONDS }),
    })
    const store = renderGuard()
    const user = userEvent.setup()

    await user.click(screen.getByRole('button', { name: /^log out$/i }))

    expect(mockEndSession).toHaveBeenCalled()
    expect(store.getState().auth.accessToken).toBeNull()
    expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true })
  })

  describe('countdown reaching zero', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('automatically logs out once the countdown reaches zero', async () => {
      const remainingSeconds = 2
      mockUseSessionStatusQuery.mockReturnValue({ data: status({ remainingSeconds }) })
      const store = renderGuard()

      expect(screen.getByText(new RegExp(`${remainingSeconds} seconds`, 'i'))).toBeInTheDocument()

      await act(async () => {
        await vi.advanceTimersByTimeAsync(remainingSeconds * 1000)
      })

      expect(mockEndSession).toHaveBeenCalled()
      expect(store.getState().auth.accessToken).toBeNull()
      expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true })
    })
  })
})
