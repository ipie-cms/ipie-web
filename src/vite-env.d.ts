/// <reference types="vite/client" />

/**
 * These are read in ONE place only - runtimeConfig.ts's test fallback, where there is no server to
 * fetch /config.json from and the values come from .env.test instead.
 *
 * Application code must not read them. A value compiled into the bundle pins that bundle to one
 * environment, which is exactly what the runtime configuration exists to avoid.
 */
interface ImportMetaEnv {
  readonly VITE_USER_SERVICE_BASE_URL: string
  readonly VITE_IAM_SERVICE_BASE_URL: string
  readonly VITE_COMMUNICATION_SERVICE_BASE_URL: string
  readonly VITE_KEYCLOAK_BASE_URL: string
  readonly VITE_KEYCLOAK_REALM: string
  readonly VITE_KEYCLOAK_CLIENT_ID: string
  readonly VITE_KEYCLOAK_CLIENT_SECRET: string
  readonly VITE_KEYCLOAK_SSO_CLIENT_ID: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
