import { describe, expect, it } from 'vitest'
import { configureStore } from '@reduxjs/toolkit'
import { Provider } from 'react-redux'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { render, screen } from '@testing-library/react'

import authReducer, { type AuthState } from '@/features/auth/authSlice'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { AUTHENTICATED_STATE, LOGGED_OUT_STATE } from '@/test/authFixtures'

function renderProtectedRoute(authState: AuthState) {
  const store = configureStore({
    reducer: { auth: authReducer },
    preloadedState: { auth: authState },
  })
  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/users']}>
        <Routes>
          <Route path="/login" element={<div>Login page</div>} />
          <Route element={<ProtectedRoute />}>
            <Route path="/users" element={<div>Users page</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </Provider>,
  )
}

describe('ProtectedRoute', () => {
  it('renders the nested route when an access token is present', () => {
    renderProtectedRoute(AUTHENTICATED_STATE)

    expect(screen.getByText('Users page')).toBeInTheDocument()
  })

  it('redirects to /login when there is no access token', () => {
    renderProtectedRoute(LOGGED_OUT_STATE)

    expect(screen.getByText('Login page')).toBeInTheDocument()
    expect(screen.queryByText('Users page')).not.toBeInTheDocument()
  })
})
