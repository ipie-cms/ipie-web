import { useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { apiErrorMessage } from '@/lib/apiError'
import { groupByResource } from '@/lib/permissionCatalogue'
import { useCreatePermissionMutation, useListPermissionsQuery } from '@/api/rolesApi'

/** Mirrors the backend's `@Size` constraint, so the form fails before the round trip. */
const MAX_DESCRIPTION_LENGTH = 255

/** `CreatePermissionRequest`'s column-matched sizes and its SCREAMING_SNAKE_CASE `@Pattern`. */
const MAX_PERMISSION_NAME_LENGTH = 100
const MAX_RESOURCE_LENGTH = 100
const SCREAMING_SNAKE_CASE = /^[A-Z][A-Z0-9_]*$/


/**
 * Creating a catalogue entry. Create-only by design: there is no edit or delete, because a
 * permission name is matched literally by a `@RequiresPermission` in some service and by a Keycloak
 * realm role, so renaming or removing one silently un-grants it everywhere it is checked. Composing
 * it into a role is the next step, in the Roles section below.
 */
function PermissionCreateDialog({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState('')
  const [resource, setResource] = useState('')
  const [description, setDescription] = useState('')
  const [createPermission, { isLoading, error }] = useCreatePermissionMutation()

  const trimmedName = name.trim()
  const trimmedResource = resource.trim()
  const nameValid = SCREAMING_SNAKE_CASE.test(trimmedName)
  const resourceValid = SCREAMING_SNAKE_CASE.test(trimmedResource)
  const canSave = nameValid && resourceValid && !isLoading

  async function handleSave() {
    if (!canSave) return
    const result = await createPermission({
      name: trimmedName,
      resource: trimmedResource,
      description: description.trim() || undefined,
    })
    if (!('error' in result)) onClose()
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New permission</DialogTitle>
          <DialogDescription>
            Adds an entry to the catalogue roles are composed from. It grants nothing on its own —
            a permission takes effect once a service checks for it by name and a role granting it is
            assigned.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="permission-name">Name</Label>
            <Input
              id="permission-name"
              value={name}
              maxLength={MAX_PERMISSION_NAME_LENGTH}
              placeholder="CLAIMS_APPROVE"
              onChange={(event) => setName(event.target.value.toUpperCase())}
            />
            {trimmedName.length > 0 && !nameValid && (
              <p className="text-destructive text-xs">
                Use SCREAMING_SNAKE_CASE — letters, digits and underscores, starting with a letter.
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="permission-resource">Resource</Label>
            <Input
              id="permission-resource"
              value={resource}
              maxLength={MAX_RESOURCE_LENGTH}
              placeholder="CLAIMS"
              onChange={(event) => setResource(event.target.value.toUpperCase())}
            />
            <p className="text-muted-foreground text-xs">
              The axis this permission applies to. The catalogue is grouped by it.
            </p>
            {trimmedResource.length > 0 && !resourceValid && (
              <p className="text-destructive text-xs">
                Use SCREAMING_SNAKE_CASE — letters, digits and underscores, starting with a letter.
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="permission-description">Description</Label>
            <Textarea
              id="permission-description"
              value={description}
              maxLength={MAX_DESCRIPTION_LENGTH}
              placeholder="What this permission allows"
              onChange={(event) => setDescription(event.target.value)}
            />
          </div>
        </div>

        {error && (
          <p className="text-destructive text-sm">
            {apiErrorMessage(error, 'Could not create the permission.')}
          </p>
        )}

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSave} disabled={!canSave}>
            {isLoading ? 'Creating…' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/**
 * The permission catalogue: what capabilities exist at all.
 *
 * Separate from Roles deliberately, and ordered before it in the navigation, because the two are
 * different acts performed at different times. A permission is the unit a service checks for by
 * name; a role is a bundle of permissions that already exist. Composing a role from entries that
 * have not been defined is impossible, so defining comes first - and putting both on one page
 * invited exactly that ordering mistake.
 *
 * Assigning a role to a person is a third thing again, and lives on the Users page where the person
 * is in view. That one hands out a capability that already exists (ROLES_MANAGE); everything here
 * decides what capabilities exist (RBAC_DEFINE, SUPER_ADMIN only).
 *
 * Every write is guarded by RBAC_DEFINE server-side. Hiding the nav entry without it is
 * presentation, never the enforcement.
 */
export function PermissionsPage() {
  const { data: permissions, isLoading, isError } = useListPermissionsQuery()
  const [creating, setCreating] = useState(false)

  const grouped = useMemo(() => groupByResource(permissions ?? []), [permissions])

  return (
    <div className="flex h-full flex-col gap-6 overflow-y-auto p-6">
      <Card className="flex flex-1 flex-col">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Permissions</CardTitle>
          <Button type="button" onClick={() => setCreating(true)}>
            New permission
          </Button>
        </CardHeader>
        <CardContent className="flex-1">
          {isLoading && <p className="text-muted-foreground text-sm">Loading…</p>}
          {isError && <p className="text-destructive text-sm">Failed to load permissions.</p>}
          {permissions && permissions.length === 0 && (
            <p className="text-muted-foreground text-sm">No permissions in the catalogue.</p>
          )}
          {grouped.length > 0 && (
            <div className="flex flex-col gap-3">
              {grouped.map(([resource, items]) => (
                <fieldset key={resource} className="rounded-md border p-3">
                  <legend className="px-1 text-xs font-medium uppercase">{resource}</legend>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {items.map((permission) => (
                      <div key={permission.id} className="min-w-0 text-sm">
                        <p className="font-medium">{permission.name}</p>
                        {permission.description && (
                          <p className="text-muted-foreground text-xs">{permission.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </fieldset>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {creating && <PermissionCreateDialog onClose={() => setCreating(false)} />}
    </div>
  )
}
