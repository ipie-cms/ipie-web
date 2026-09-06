import { afterEach, describe, expect, it } from 'vitest'

import authReducer, { logout, setCredentials } from '@/features/auth/authSlice'
import { loadStoredAuth } from '@/lib/authStorage'
import { LOGGED_OUT_STATE, TEST_CREDENTIALS } from '@/test/authFixtures'

const credentials = TEST_CREDENTIALS
const emptyState = LOGGED_OUT_STATE

describe('authSlice', () => {
  afterEach(() => {
    localStorage.clear()
  })

  it('starts logged out when nothing is in storage', () => {
    expect(authReducer(undefined, { type: '@@INIT' })).toEqual(emptyState)
  })

  it('setCredentials populates state and persists to storage', () => {
    const state = authReducer(emptyState, setCredentials(credentials))

    expect(state).toEqual(credentials)
    expect(loadStoredAuth()).toEqual(credentials)
  })

  it('logout clears state and storage', () => {
    const loggedIn = authReducer(emptyState, setCredentials(credentials))

    const state = authReducer(loggedIn, logout())

    expect(state).toEqual(emptyState)
    expect(loadStoredAuth()).toBeNull()
  })
})
