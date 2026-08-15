import { useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
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
import {
  useCreateRoleMutation,
  useDeleteRoleMutation,
  useListPermissionsQuery,
  useListRolesQuery,
  useUpdateRoleMutation,
  type PermissionResponse,
  type RoleResponse,
} from '@/api/rolesApi'

/** Mirrors the backend's `@Size` constraints so the form fails before the round trip, not after. */
const MAX_NAME_LENGTH = 50
const MAX_DESCRIPTION_LENGTH = 255


interface RoleEditorProps {
  /** The role being edited, or null when composing a new one. */
  role: RoleResponse | null
  permissions: PermissionResponse[]
  onClose: () => void
}

/**
 * Create/edit form. The two modes share everything except the name field, which is editable only
 * on create - a role's name is the identifier every issued JWT and permission check is keyed on,
 * so the backend refuses to change it (see `UpdateRoleRequest`).
 */
function RoleEditorDialog({ role, permissions, onClose }: RoleEditorProps) {
  const isEdit = role !== null
  const [name, setName] = useState(role?.name ?? '')
  const [description, setDescription] = useState(role?.description ?? '')
  const [selected, setSelected] = useState<Set<string>>(new Set(role?.permissionNames ?? []))

  const [createRole, createState] = useCreateRoleMutation()
  const [updateRole, updateState] = useUpdateRoleMutation()
  const isSaving = createState.isLoading || updateState.isLoading
  const saveError = createState.error ?? updateState.error

  const grouped = useMemo(() => groupByResource(permissions), [permissions])

  function togglePermission(permissionName: string) {
    setSelected((current) => {
      const next = new Set(current)
      if (next.has(permissionName)) next.delete(permissionName)
      else next.add(permissionName)
      return next
    })
  }

  // Same rules the backend enforces (@NotBlank name, @NotEmpty permissions) - a role with no
  // permissions is the failure mode worth blocking hardest, since it looks correct everywhere and
  // grants nothing.
  const trimmedName = name.trim()
  const canSave = trimmedName.length > 0 && selected.size > 0 && !isSaving

  async function handleSave() {
    if (!canSave) return
    const permissionNames = [...selected]
    const trimmedDescription = description.trim()
    const result = isEdit
      ? await updateRole({
          roleId: role.id,
          description: trimmedDescription || undefined,
          permissionNames,
        })
      : await createRole({
          name: trimmedName,
          description: trimmedDescription || undefined,
          permissionNames,
        })
    // Only dismiss once the write actually landed; on failure the dialog stays open with the
    // administrator's selections intact and the server's message below.
    if (!('error' in result)) onClose()
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="flex max-h-[85vh] flex-col sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? `Edit ${role.name}` : 'New role'}</DialogTitle>
          <DialogDescription>
            A role grants every permission selected below to each user it is assigned to.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-1 flex-col gap-4 overflow-y-auto">
          <div className="flex flex-col gap-2">
            <Label htmlFor="role-name">Name</Label>
            <Input
              id="role-name"
              value={name}
              disabled={isEdit}
              maxLength={MAX_NAME_LENGTH}
              placeholder="RESOLUTION_PROFESSIONAL"
              onChange={(event) => setName(event.target.value)}
            />
            {isEdit && (
              <p className="text-muted-foreground text-xs">
                A role's name cannot change once created — issued tokens are keyed on it.
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="role-description">Description</Label>
            <Textarea
              id="role-description"
              value={description}
              maxLength={MAX_DESCRIPTION_LENGTH}
              placeholder="What this role is for"
              onChange={(event) => setDescription(event.target.value)}
            />
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-baseline justify-between">
              <Label>Permissions</Label>
              <span className="text-muted-foreground text-xs">{selected.size} selected</span>
            </div>
            {grouped.length === 0 && (
              <p className="text-muted-foreground text-sm">No permissions in the catalogue.</p>
            )}
            {grouped.map(([resource, items]) => (
              <fieldset key={resource} className="rounded-md border p-3">
                <legend className="px-1 text-xs font-medium uppercase">{resource}</legend>
                <div className="grid gap-2 sm:grid-cols-2">
                  {items.map((permission) => (
                    <label
                      key={permission.id}
                      className="flex items-start gap-2 text-sm"
                      title={permission.description ?? undefined}
                    >
                      <Checkbox
                        // Named explicitly rather than relying on the wrapping label: the control
                        // is a button under the hood, and the label also carries the description
                        // as a tooltip.
                        aria-label={permission.name}
                        checked={selected.has(permission.name)}
                        onCheckedChange={() => togglePermission(permission.name)}
                      />
                      <span>{permission.name}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            ))}
          </div>
        </div>

        {saveError && (
          <p className="text-destructive text-sm">
            {apiErrorMessage(saveError, 'Could not save the role.')}
          </p>
        )}
        {selected.size === 0 && (
          <p className="text-muted-foreground text-sm">Select at least one permission.</p>
        )}

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSave} disabled={!canSave}>
            {isSaving ? 'Saving…' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/**
 * Deletion is confirmed rather than immediate, and can still be refused server-side: a role that
 * users still hold returns ROLE_IN_USE, because deleting it would silently strip access from
 * those users on their next token refresh. That message is surfaced here verbatim.
 */
function DeleteRoleDialog({ role, onClose }: { role: RoleResponse; onClose: () => void }) {
  const [deleteRole, { isLoading, error }] = useDeleteRoleMutation()

  async function handleDelete() {
    const result = await deleteRole(role.id)
    if (!('error' in result)) onClose()
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete {role.name}?</DialogTitle>
          <DialogDescription>
            This removes the role here and from Keycloak. Users currently holding it must be revoked
            first.
          </DialogDescription>
        </DialogHeader>
        {error && (
          <p className="text-destructive text-sm">
            {apiErrorMessage(error, 'Could not delete the role.')}
          </p>
        )}
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="button" variant="destructive" onClick={handleDelete} disabled={isLoading}>
            {isLoading ? 'Deleting…' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/**
 * Defining the RBAC catalogue: the permissions that exist, and the roles composed from them.
 * Permissions come first because a role can only be composed from entries that already exist.
 *
 * Assigning a role to a person happens on the Users page, where the person is in view - see
 * `UserRolesPanel`. That is a different power and a different permission: assigning hands out a
 * capability that already exists (ROLES_MANAGE, held by STAKEHOLDER_ADMIN), while everything on
 * this page decides what capabilities exist at all (RBAC_DEFINE, SUPER_ADMIN only).
 *
 * Every write here is guarded by RBAC_DEFINE server-side; the nav entry that reaches this page is
 * hidden without it, which is presentation only and never the enforcement.
 */
export function RolesPage() {
  const { data: roles, isLoading, isError } = useListRolesQuery()
  // Still needed here: the role editor composes a role from the existing catalogue.
  const { data: permissions } = useListPermissionsQuery()
  const [editing, setEditing] = useState<{ role: RoleResponse | null } | null>(null)
  const [deleting, setDeleting] = useState<RoleResponse | null>(null)

  return (
    <div className="flex h-full flex-col gap-6 overflow-y-auto p-6">
      <Card className="flex flex-1 flex-col">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Roles</CardTitle>
          <Button type="button" onClick={() => setEditing({ role: null })}>
            New role
          </Button>
        </CardHeader>
        <CardContent className="flex-1">
          {isLoading && <p className="text-muted-foreground text-sm">Loading…</p>}
          {isError && <p className="text-destructive text-sm">Failed to load roles.</p>}
          {roles && roles.length === 0 && (
            <p className="text-muted-foreground text-sm">No roles defined yet.</p>
          )}
          {roles && roles.length > 0 && (
            <ul className="flex flex-col divide-y">
              {roles.map((role) => (
                <li key={role.id} className="flex items-center justify-between gap-4 py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{role.name}</p>
                    <p className="text-muted-foreground text-xs">
                      {role.description || 'No description'} — {role.permissionNames.length}{' '}
                      permission
                      {role.permissionNames.length === 1 ? '' : 's'}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Button type="button" variant="ghost" onClick={() => setEditing({ role })}>
                      Edit
                    </Button>
                    <Button type="button" variant="ghost" onClick={() => setDeleting(role)}>
                      Delete
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {editing && (
        <RoleEditorDialog
          // Remounts between roles so the form state below re-seeds from the new role rather than
          // keeping the previously edited one's selections.
          key={editing.role?.id ?? 'new'}
          role={editing.role}
          permissions={permissions ?? []}
          onClose={() => setEditing(null)}
        />
      )}
      {deleting && <DeleteRoleDialog role={deleting} onClose={() => setDeleting(null)} />}
    </div>
  )
}
