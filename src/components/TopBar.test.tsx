import { beforeEach, describe, expect, it, vi } from 'vitest'
import { configureStore } from '@reduxjs/toolkit'
import { Provider } from 'react-redux'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import authReducer from '@/features/auth/authSlice'
import { TopBar } from '@/components/TopBar'
import { AUTHENTICATED_STATE, TEST_USERNAME } from '@/test/authFixtures'

const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

function renderTopBar() {
  const store = configureStore({
    reducer: { auth: authReducer },
    preloadedState: { auth: AUTHENTICATED_STATE },
  })
  render(
    <Provider store={store}>
      <TopBar />
    </Provider>,
  )
  return store
}

describe('TopBar', () => {
  beforeEach(() => {
    mockNavigate.mockReset()
  })

  it('shows the signed-in username', () => {
    renderTopBar()

    expect(screen.getByText(TEST_USERNAME)).toBeInTheDocument()
  })

  it('logs out and navigates to /login when "Log out" is clicked', async () => {
    const store = renderTopBar()
    const user = userEvent.setup()

    await user.click(screen.getByRole('button', { name: /log out/i }))

    expect(store.getState().auth.accessToken).toBeNull()
    expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true })
  })
})
