import { useAppSelector } from '@/app/hooks'
import { decodeJwtPayload } from '@/lib/decodeJwt'

/**
 * Decodes the current access token's `permissions` claim - purely to decide what to *show*
 * (nav items, links); the real enforcement is always server-side (`@RequiresPermission` on the
 * relevant backend). An unauthenticated/malformed token yields an empty list, never a throw.
 */
export function usePermissions(): string[] {
  const accessToken = useAppSelector((state) => state.auth.accessToken)
  if (!accessToken) return []
  try {
    const claims = decodeJwtPayload(accessToken)
    return Array.isArray(claims.permissions) ? (claims.permissions as string[]) : []
  } catch {
    return []
  }
}

export function useHasPermission(permission: string): boolean {
  return usePermissions().includes(permission)
}
