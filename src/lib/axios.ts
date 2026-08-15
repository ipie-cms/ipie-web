import axios, { type AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios'

import { clearStoredAuth, loadStoredAuth, saveStoredAuth, type StoredAuth } from '@/lib/authStorage'
import { loadStoredLocale } from '@/lib/localeStorage'

const keycloakBaseUrl = import.meta.env.VITE_KEYCLOAK_BASE_URL
const keycloakRealm = import.meta.env.VITE_KEYCLOAK_REALM
// The confidential (ROPC) client - refreshing a token issued to this client must also present its
// secret; refreshing a token issued to the public SSO client (VITE_KEYCLOAK_SSO_CLIENT_ID, see
// StoredAuth.clientId) must not. See refreshAccessToken.
const confidentialClientId = import.meta.env.VITE_KEYCLOAK_CLIENT_ID
const confidentialClientSecret = import.meta.env.VITE_KEYCLOAK_CLIENT_SECRET

interface RefreshTokenResponse {
  access_token: string
  refresh_token: string
}

interface RetriableRequestConfig extends InternalAxiosRequestConfig {
  _retried?: boolean
}

/**
 * Exchanges a stored refresh token for a new access/refresh pair, presenting whichever client
 * (`stored.clientId`) originally issued them - Keycloak requires the refresh call to come from the
 * same client, secret included if it's confidential. Uses a bare `axios.post`, never one of
 * `createAuthedClient`'s clients or `keycloakClient` - this call must not itself carry the
 * response interceptor below (no recursion risk), and a failure here must propagate to the caller
 * immediately, not get retried.
 */
async function refreshAccessToken(stored: StoredAuth): Promise<StoredAuth> {
  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    client_id: stored.clientId,
    refresh_token: stored.refreshToken,
  })
  if (stored.clientId === confidentialClientId) {
    body.set('client_secret', confidentialClientSecret)
  }

  const response = await axios.post<RefreshTokenResponse>(
    `${keycloakBaseUrl}/realms/${keycloakRealm}/protocol/openid-connect/token`,
    body,
  )

  const refreshed: StoredAuth = {
    accessToken: response.data.access_token,
    refreshToken: response.data.refresh_token,
    username: stored.username,
    clientId: stored.clientId,
  }
  saveStoredAuth(refreshed)
  return refreshed
}

/**
 * The stored session can no longer be salvaged (no refresh token to try, or Keycloak rejected the
 * refresh attempt - e.g. it expired or was revoked). A hard navigation, not react-router's
 * `useNavigate()` - this runs inside an axios interceptor, outside the component tree, and the
 * resulting full page reload is what re-seeds `authSlice`'s `initialState` from the now-cleared
 * storage; a soft navigate would leave stale Redux auth state behind.
 */
function forceLogout() {
  clearStoredAuth()
  window.location.assign('/login')
}

const REFRESH_LOCK_NAME = 'ipie-web:token-refresh'

/**
 * Coordinates a refresh *across every open tab* of this app - the single-flight guard below only
 * covers concurrent requests within one tab. This matters because the realm now enables
 * `revokeRefreshToken` (see `realm-export.json`): a refresh token is single-use, so two tabs
 * racing to refresh with the same now-stale token would have one succeed and the other rejected
 * as a replay, which kills the *whole* session, logging the user out of both tabs for no actual
 * malicious reason. Uses the Web Locks API (`navigator.locks`) - a real cross-tab mutex, not a
 * homegrown `localStorage`-timestamp approximation - so only one tab's code performs the actual
 * network call at a time; every other tab waits its turn.
 *
 * After acquiring the lock, re-reads storage first - another tab may have already refreshed while
 * this one was queued, in which case its result is already sitting there and this tab must use
 * that instead of calling Keycloak again with what would now be a stale, already-used token.
 *
 * Falls back to a plain, single-tab-only refresh when the Web Locks API isn't available (an
 * older browser, or a test environment without it) - strictly less coordinated, never less
 * correct: `revokeRefreshToken` only actually bites in the multi-tab-race case this guards
 * against, so its absence just means one specific race is no longer covered, not that a normal,
 * single-tab refresh stops working.
 */
export async function refreshAccessTokenAcrossTabs(
  stored: StoredAuth,
  refresh: (stored: StoredAuth) => Promise<StoredAuth> = refreshAccessToken,
): Promise<StoredAuth> {
  if (typeof navigator === 'undefined' || !navigator.locks) {
    return refresh(stored)
  }
  return navigator.locks.request(REFRESH_LOCK_NAME, async () => {
    const current = loadStoredAuth()
    if (current && current.refreshToken !== stored.refreshToken) {
      return current
    }
    return refresh(stored)
  })
}

// Single-flight guard: if several requests hit a 401 at the same moment (the common case - a
// batch of calls all riding the same now-expired access token), they must trigger exactly one
// refresh call and all await its result, not one refresh call each. This covers same-tab
// concurrency cheaply, without even touching the cross-tab lock above for the common case.
let refreshPromise: Promise<StoredAuth> | null = null

/**
 * Refreshes and retries once on a 401 (an *authentication* failure a new token can fix), never on
 * a 403 (an *authorization* failure - the caller's permissions, not their token, are the problem;
 * refreshing changes nothing). `refresh` is injectable for testing; production callers always use
 * the default (itself layering the cross-tab lock above the raw network call).
 */
export async function handleAuthedResponseError(
  client: AxiosInstance,
  error: AxiosError,
  refresh: (stored: StoredAuth) => Promise<StoredAuth> = refreshAccessTokenAcrossTabs,
): Promise<unknown> {
  const original = error.config as RetriableRequestConfig | undefined
  const stored = loadStoredAuth()

  if (error.response?.status !== 401 || !original || original._retried || !stored) {
    throw error
  }
  original._retried = true

  try {
    refreshPromise ??= refresh(stored).finally(() => {
      refreshPromise = null
    })
    const refreshed = await refreshPromise
    original.headers.set('Authorization', `Bearer ${refreshed.accessToken}`)
    return await client(original)
  } catch (refreshError) {
    forceLogout()
    throw refreshError
  }
}

function createAuthedClient(baseURL: string) {
  const client = axios.create({ baseURL })

  client.interceptors.request.use((config) => {
    const token = loadStoredAuth()?.accessToken
    if (token) {
      config.headers.set('Authorization', `Bearer ${token}`)
    }
    // Backend's SupportedLocaleResolver (common-i18n) reads this to pick the response/error
    // message language - see ipie-i18n-defaults.yml. Read directly from storage, not the Redux
    // store, for the same reason the auth token above is: this module has no store import.
    config.headers.set('Accept-Language', loadStoredLocale())
    return config
  })

  client.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => handleAuthedResponseError(client, error),
  )

  return client
}

// ipie-user-service - registration/verification flow, GET /api/v1/users/me, and the
// /api/v1/session/* endpoints common-session contributes to every service (see sessionApi).
//
// There was a second client here, `backendClient`, built from a VITE_API_BASE_URL that still
// pointed at :8091 - a port nothing has listened on since the services settled on 8092/8093/8094.
// Only sessionApi used it, so session status/extend/logout failed outright while every other slice
// worked. Removed rather than repointed: it would have duplicated this client exactly.
export const userServiceClient = createAuthedClient(import.meta.env.VITE_USER_SERVICE_BASE_URL)

// ipie-iam-service - GET /api/v1/users/me/roles for the dashboard's role-based content.
export const iamServiceClient = createAuthedClient(import.meta.env.VITE_IAM_SERVICE_BASE_URL)

// ipie-communication-service - GET /api/v1/notifications (NOTIFICATIONS_VIEW, SUPER_ADMIN only).
export const communicationServiceClient = createAuthedClient(import.meta.env.VITE_COMMUNICATION_SERVICE_BASE_URL)

// Talks directly to Keycloak's token endpoint (resource owner password grant) - no auth
// header, since obtaining the token is the point of the request. Deliberately built via plain
// axios.create, not createAuthedClient - a login/token attempt must never trigger the
// refresh-and-retry interceptor above.
export const keycloakClient = axios.create({
  baseURL: import.meta.env.VITE_KEYCLOAK_BASE_URL,
})

// ipie-iam-service, unauthenticated. Setting a first password is the one credential operation
// whose caller has no token yet - having no credentials is precisely the situation it exists to
// end - so it must not carry an Authorization header, and must not go through the
// refresh-and-retry interceptor createAuthedClient installs: there is no session to refresh, and a
// 422 for an expired link would be retried as though it were an auth failure. Same reasoning as
// keycloakClient above. The one-time token in the request body is the authorisation.
export const publicIamServiceClient = axios.create({
  baseURL: import.meta.env.VITE_IAM_SERVICE_BASE_URL,
})
