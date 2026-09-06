import type { AuthState, Credentials } from '@/features/auth/authSlice'

// One shared source of truth for the auth values reused across test files, instead of each test
// hardcoding its own copy of a fake token/username.
export const TEST_ACCESS_TOKEN = 'access-123'
export const TEST_REFRESH_TOKEN = 'refresh-123'
export const TEST_USERNAME = 'jdoe'
export const TEST_CLIENT_ID = 'ipie-service-template'

// Non-nullable shape - for setCredentials()/saveStoredAuth() and anything else that requires a
// real, logged-in set of values rather than the nullable AuthState shape.
export const TEST_CREDENTIALS: Credentials = {
  accessToken: TEST_ACCESS_TOKEN,
  refreshToken: TEST_REFRESH_TOKEN,
  username: TEST_USERNAME,
  clientId: TEST_CLIENT_ID,
}

export const AUTHENTICATED_STATE: AuthState = TEST_CREDENTIALS

export const LOGGED_OUT_STATE: AuthState = {
  accessToken: null,
  refreshToken: null,
  username: null,
  clientId: null,
}
