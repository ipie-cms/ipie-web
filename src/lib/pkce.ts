// PKCE (RFC 7636) helpers for the pillar-SSO login path ("Login with IBBI") - the only login
// flow in this app that uses the OIDC Authorization Code grant (see keycloakApi.ts's ROPC login
// for the existing username/password path, which needs none of this). Web Crypto API only, no
// new dependency.

const VERIFIER_STORAGE_KEY = 'ipie.sso.codeVerifier'

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = ''
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte)
  })
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function randomVerifier(): string {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return base64UrlEncode(bytes)
}

async function challengeFromVerifier(verifier: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier))
  return base64UrlEncode(new Uint8Array(digest))
}

/** Generates a fresh verifier/challenge pair and stashes the verifier for the callback to retrieve. */
export async function createPkcePair(): Promise<{ verifier: string; challenge: string }> {
  const verifier = randomVerifier()
  const challenge = await challengeFromVerifier(verifier)
  sessionStorage.setItem(VERIFIER_STORAGE_KEY, verifier)
  return { verifier, challenge }
}

/** Retrieves and clears the verifier stashed by {@link createPkcePair} - one-shot, matching the redirect round trip. */
export function consumeStoredVerifier(): string | null {
  const verifier = sessionStorage.getItem(VERIFIER_STORAGE_KEY)
  sessionStorage.removeItem(VERIFIER_STORAGE_KEY)
  return verifier
}
