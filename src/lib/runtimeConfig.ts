/**
 * Configuration the application reads at runtime, not at build time.
 *
 * WHY THIS EXISTS. Vite substitutes `import.meta.env.VITE_*` into the bundle when it is built, so
 * a build carries one environment's endpoints inside it. That would mean five different artifacts
 * for five environments, and the artifact validated in UAT would not be the artifact that reaches
 * Production - which is the promotion rule the pipeline and the branching model are built on
 * (Development Environment Configuration, Sections 41 and 45).
 *
 * So the bundle is built once and knows nothing about where it runs. It fetches `/config.json` on
 * startup, and whatever serves the static files supplies the file for that environment - a mounted
 * ConfigMap, a file baked into the serving layer, whatever the platform provides. Promotion stays
 * honest: the same digest runs everywhere.
 *
 * NOTHING SECRET BELONGS IN HERE. Everything in this file is delivered to the browser and readable
 * by anyone who opens developer tools. That is already true of the values it replaces - a value
 * compiled into a bundle is no less public than one fetched beside it - but it is worth stating,
 * because `keycloakClientSecret` below is a confidential client's secret being used from a browser.
 * It is not protecting anything, and the flow should move to a public client with PKCE, which is
 * how the SSO client already works. Recorded rather than quietly perpetuated.
 */

export interface RuntimeConfig {
  userServiceBaseUrl: string
  iamServiceBaseUrl: string
  communicationServiceBaseUrl: string
  keycloakBaseUrl: string
  keycloakRealm: string
  /** Confidential (resource-owner password) client used by the username/password login. */
  keycloakClientId: string
  /** See the note above: public by construction, and not a secret in any useful sense. */
  keycloakClientSecret: string
  /** Public, PKCE-only client for the stakeholder-SSO path ("Login with IBBI"). */
  keycloakSsoClientId: string
}

const REQUIRED_KEYS: (keyof RuntimeConfig)[] = [
  'userServiceBaseUrl',
  'iamServiceBaseUrl',
  'communicationServiceBaseUrl',
  'keycloakBaseUrl',
  'keycloakRealm',
  'keycloakClientId',
  'keycloakClientSecret',
  'keycloakSsoClientId',
]

let config: RuntimeConfig | null = null

/**
 * Fetches and validates the configuration. Call once, before any module that reads it is imported -
 * `main.tsx` does this and only then loads the application.
 *
 * A missing or incomplete file rejects rather than falling back to a default. An application that
 * starts against the wrong endpoints looks like it is working, and the first sign of trouble is a
 * user's data going somewhere it should not.
 */
export async function loadRuntimeConfig(): Promise<RuntimeConfig> {
  // `cache: 'no-store'` matters on promotion: the bundle is immutable and long-cached, but this
  // file changes per environment and must never be served from a stale cache entry.
  const response = await fetch('/config.json', { cache: 'no-store' })
  if (!response.ok) {
    throw new Error(`Could not load /config.json (HTTP ${response.status}).`)
  }

  const loaded = (await response.json()) as Partial<RuntimeConfig>
  const missing = REQUIRED_KEYS.filter((key) => !loaded[key])
  if (missing.length > 0) {
    throw new Error(`/config.json is missing: ${missing.join(', ')}`)
  }

  config = loaded as RuntimeConfig
  return config
}

/**
 * The loaded configuration.
 *
 * Under Vitest there is no server to fetch from, so the values come from `.env.test` instead. That
 * fallback is deliberately limited to the test mode: in a browser it would let a misconfigured
 * deployment start on whatever happened to be compiled in, which is the failure this module exists
 * to prevent.
 */
export function getRuntimeConfig(): RuntimeConfig {
  if (config) {
    return config
  }

  if (import.meta.env.MODE === 'test') {
    config = {
      userServiceBaseUrl: import.meta.env.VITE_USER_SERVICE_BASE_URL,
      iamServiceBaseUrl: import.meta.env.VITE_IAM_SERVICE_BASE_URL,
      communicationServiceBaseUrl: import.meta.env.VITE_COMMUNICATION_SERVICE_BASE_URL,
      keycloakBaseUrl: import.meta.env.VITE_KEYCLOAK_BASE_URL,
      keycloakRealm: import.meta.env.VITE_KEYCLOAK_REALM,
      keycloakClientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID,
      keycloakClientSecret: import.meta.env.VITE_KEYCLOAK_CLIENT_SECRET,
      keycloakSsoClientId: import.meta.env.VITE_KEYCLOAK_SSO_CLIENT_ID,
    }
    return config
  }

  throw new Error(
    'Runtime configuration was read before loadRuntimeConfig() resolved. Any module that reads it ' +
      'must be imported after that promise settles - see main.tsx.',
  )
}

/** Test seam: replaces the configuration, or clears it when given null. */
export function setRuntimeConfigForTests(next: RuntimeConfig | null): void {
  config = next
}
