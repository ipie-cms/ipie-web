/**
 * The one error response shape every iPIE service returns (common-libs `ApiError`, master
 * standards doc 5.3/5.4). Declared here rather than per-slice precisely because no service is
 * allowed to invent its own.
 */
export interface ApiError {
  timestamp: string
  status: number
  errorCode: string
  message: string
  path: string
  traceId: string | null
  fieldErrors: { field: string; message: string }[]
}

function apiErrorBody(error: unknown): Partial<ApiError> | null {
  if (!error || typeof error !== 'object' || !('data' in error)) return null
  const { data } = error as { data: unknown }
  if (!data || typeof data !== 'object') return null
  return data as Partial<ApiError>
}

/**
 * The backend's own message for a failed call, falling back to a caller-supplied one.
 *
 * Preferring the server's text is deliberate: it is already localised (every authed request sends
 * `Accept-Language`, which `SupportedLocaleResolver` reads), and it carries detail the UI cannot
 * reconstruct - which permission was unknown, which role is still held. A network-level failure
 * has no body at all, which is what the fallback is for.
 */
export function apiErrorMessage(error: unknown, fallback: string): string {
  const message = apiErrorBody(error)?.message
  return typeof message === 'string' && message.length > 0 ? message : fallback
}

/** Narrows on the service's `errorCode` so the UI can react to a specific failure, not a status. */
export function hasErrorCode(error: unknown, errorCode: string): boolean {
  return apiErrorBody(error)?.errorCode === errorCode
}
