// Exported (not just module-private) so callers - including tests - never need to hardcode this
// key themselves; it's the one place the localStorage key name is defined.
export const STORAGE_KEY = 'ipie.auth'

export interface StoredAuth {
  accessToken: string
  refreshToken: string
  username: string
  // Which Keycloak client issued this token pair (VITE_KEYCLOAK_CLIENT_ID for ROPC,
  // VITE_KEYCLOAK_SSO_CLIENT_ID for the stakeholder-SSO/PKCE path) - a silent token refresh must
  // present the same client the tokens were issued to, so this has to travel with them.
  clientId: string
}

export function loadStoredAuth(): StoredAuth | null {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as StoredAuth
  } catch {
    return null
  }
}

export function saveStoredAuth(auth: StoredAuth) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(auth))
}

export function clearStoredAuth() {
  localStorage.removeItem(STORAGE_KEY)
}
