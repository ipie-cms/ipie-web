import type { PermissionResponse } from '@/api/rolesApi'

/**
 * The catalogue, grouped by the ABAC axis each permission applies to. Sorted on both levels so the
 * list is stable between renders and between users - the API returns no particular order, and a
 * checkbox grid that reshuffles is one an administrator cannot scan.
 */
export function groupByResource(permissions: PermissionResponse[]): [string, PermissionResponse[]][] {
  const byResource = new Map<string, PermissionResponse[]>()
  for (const permission of permissions) {
    const existing = byResource.get(permission.resource)
    if (existing) existing.push(permission)
    else byResource.set(permission.resource, [permission])
  }
  return [...byResource.entries()]
    .map(([resource, items]): [string, PermissionResponse[]] => [
      resource,
      [...items].sort((a, b) => a.name.localeCompare(b.name)),
    ])
    .sort(([a], [b]) => a.localeCompare(b))
}
