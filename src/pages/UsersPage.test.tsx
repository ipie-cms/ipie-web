import { beforeEach, describe, expect, it, vi } from 'vitest'
import { configureStore } from '@reduxjs/toolkit'
import { Provider } from 'react-redux'
import { render, screen } from '@testing-library/react'

import authReducer from '@/features/auth/authSlice'
import { UsersPage } from '@/pages/UsersPage'
import type { PageResponse, UserResponse } from '@/api/usersApi'
import { AUTHENTICATED_STATE, TEST_USERNAME } from '@/test/authFixtures'

const mockUseSearchUsersQuery = vi.fn()

vi.mock('@/api/usersApi', () => ({
  useSearchUsersQuery: () => mockUseSearchUsersQuery(),
}))

function renderUsersPage() {
  const store = configureStore({
    reducer: { auth: authReducer },
    preloadedState: { auth: AUTHENTICATED_STATE },
  })
  render(
    <Provider store={store}>
      <UsersPage />
    </Provider>,
  )
  return store
}

const onePage: PageResponse<UserResponse> = {
  content: [
    {
      id: '1',
      keycloakUserId: 'b3f1c2d4-0000-4000-8000-000000000001',
      username: TEST_USERNAME,
      email: `${TEST_USERNAME}@example.com`,
      status: 'ACTIVE',
    },
  ],
  page: 0,
  size: 20,
  totalElements: 1,
  totalPages: 1,
}

describe('UsersPage', () => {
  beforeEach(() => {
    mockUseSearchUsersQuery.mockReset()
  })

  it('shows a loading indicator while the search is in flight', () => {
    mockUseSearchUsersQuery.mockReturnValue({ data: undefined, isLoading: true, isError: false })

    renderUsersPage()

    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it('renders the returned users once loaded', () => {
    mockUseSearchUsersQuery.mockReturnValue({ data: onePage, isLoading: false, isError: false })

    renderUsersPage()

    expect(screen.getByText(TEST_USERNAME)).toBeInTheDocument()
    expect(screen.getByText(`${TEST_USERNAME}@example.com`)).toBeInTheDocument()
    expect(screen.getByText('ACTIVE')).toBeInTheDocument()
  })

  it('shows an empty state when the search returns no users', () => {
    mockUseSearchUsersQuery.mockReturnValue({
      data: { ...onePage, content: [], totalElements: 0 },
      isLoading: false,
      isError: false,
    })

    renderUsersPage()

    expect(screen.getByText(/no users found/i)).toBeInTheDocument()
  })

  it('shows an error message when the search fails', () => {
    mockUseSearchUsersQuery.mockReturnValue({ data: undefined, isLoading: false, isError: true })

    renderUsersPage()

    expect(screen.getByText(/failed to load users/i)).toBeInTheDocument()
  })
})
