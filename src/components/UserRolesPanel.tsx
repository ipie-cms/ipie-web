import { useMemo, useState, type ReactNode } from 'react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { apiErrorMessage } from '@/lib/apiError'
import {
  useAssignRoleMutation,
  useGetRolesForUserQuery,
  useListRolesQuery,
  useRevokeRoleMutation,
  type RoleResponse,
} from '@/api/rolesApi'

interface UserRolesPanelProps {
  /** ipie-user-service's user id - what the assign/revoke endpoints are pathed on. */
  userId: string
  /** The Keycloak subject the realm-role mapping syncs against. Null before registration completes. */
  keycloakUserId: string | null
}

/**
 * Both writes require a reason. The backend accepts a null `comment` (see `AssignRoleRequest`)
 * because service-to-service callers like the USER_VERIFIED default-role assignment have no human
 * to ask; a human granting someone access does, and an audit row reading only "role granted" is
 * the one nobody can reconstruct a year later.
 */
function ReasonDialog({
  title,
  description,
  confirmLabel,
  destructive,
  pending,
  error,
  onConfirm,
  onClose,
  children,
}: {
  title: string
  description: string
  confirmLabel: string
  destructive?: boolean
  pending: boolean
  error: unknown
  onConfirm: (comment: string) => Promise<void>
  onClose: () => void
  children?: ReactNode
}) {
  const [comment, setComment] = useState('')
  const canConfirm = comment.trim().length > 0 && !pending

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {children}
          <div className="flex flex-col gap-2">
            <Label htmlFor="role-change-reason">Reason</Label>
            <Textarea
              id="role-change-reason"
              value={comment}
              placeholder="Recorded in the audit trail"
              onChange={(event) => setComment(event.target.value)}
            />
          </div>
        </div>

        {error != null && (
          <p className="text-destructive text-sm">
            {apiErrorMessage(error, 'The change could not be applied.')}
          </p>
        )}

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={onClose} disabled={pending}>
            Cancel
          </Button>
          <Button
            type="button"
            variant={destructive ? 'destructive' : 'default'}
            disabled={!canConfirm}
            onClick={() => void onConfirm(comment.trim())}
          >
            {pending ? 'Working…' : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/**
 * One user's role assignments, and the permissions those roles add up to.
 *
 * Permissions reach a user only through a role - there is no direct user-to-permission grant - so
 * the effective list below is derived, never edited here. Changing what a role carries is the
 * Roles page's job; this panel decides who holds it.
 */
export function UserRolesPanel({ userId, keycloakUserId }: UserRolesPanelProps) {
  const { data: heldRoles, isLoading, isError } = useGetRolesForUserQuery(userId)
  const { data: allRoles } = useListRolesQuery()
  const [assignRole, assignState] = useAssignRoleMutation()
  const [revokeRole, revokeState] = useRevokeRoleMutation()

  const [isAssigning, setIsAssigning] = useState(false)
  const [selectedRoleName, setSelectedRoleName] = useState<string>('')
  const [revoking, setRevoking] = useState<RoleResponse | null>(null)

  const assignable = useMemo(() => {
    const held = new Set((heldRoles ?? []).map((role) => role.name))
    return (allRoles ?? []).filter((role) => !held.has(role.name))
  }, [allRoles, heldRoles])

  const effectivePermissions = useMemo(
    () => [...new Set((heldRoles ?? []).flatMap((role) => role.permissionNames))].sort(),
    [heldRoles],
  )

  if (isLoading) return <p className="text-muted-foreground text-xs">Loading roles…</p>
  if (isError) return <p className="text-destructive text-xs">Failed to load roles.</p>

  // No Keycloak account yet, so there is nothing to sync a realm-role mapping against. Assigning
  // would fail server-side; saying why is more use than a disabled button with no explanation.
  if (!keycloakUserId) {
    return (
      <p className="text-muted-foreground text-xs">
        Roles can be granted once this user completes registration.
      </p>
    )
  }

  function closeAssign() {
    setIsAssigning(false)
    setSelectedRoleName('')
    assignState.reset()
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <span className="text-xs font-medium">Roles</span>
        {heldRoles && heldRoles.length === 0 && (
          <p className="text-muted-foreground text-xs">No roles assigned.</p>
        )}
        {heldRoles?.map((role) => (
          <div key={role.id} className="flex items-center justify-between gap-4 text-xs">
            <span>
              <span className="font-medium">{role.name}</span>
              {role.description && (
                <span className="text-muted-foreground"> — {role.description}</span>
              )}
            </span>
            <Button
              type="button"
              variant="ghost"
              className="h-7 px-2 text-xs"
              onClick={() => setRevoking(role)}
            >
              Revoke
            </Button>
          </div>
        ))}
      </div>

      <div>
        <Button
          type="button"
          variant="outline"
          className="h-7 px-2 text-xs"
          disabled={assignable.length === 0}
          onClick={() => setIsAssigning(true)}
        >
          {assignable.length === 0 ? 'All roles assigned' : 'Assign role'}
        </Button>
      </div>

      {effectivePermissions.length > 0 && (
        <details>
          <summary className="text-muted-foreground cursor-pointer text-xs">
            Effective permissions ({effectivePermissions.length})
          </summary>
          <ul className="mt-1 flex flex-wrap gap-x-3 gap-y-1">
            {effectivePermissions.map((permission) => (
              <li key={permission} className="text-muted-foreground text-xs">
                {permission}
              </li>
            ))}
          </ul>
        </details>
      )}

      {isAssigning && (
        <ReasonDialog
          title="Assign role"
          description="The user gains every permission the selected role carries."
          confirmLabel="Assign"
          pending={assignState.isLoading}
          error={assignState.error}
          onClose={closeAssign}
          onConfirm={async (comment) => {
            const result = await assignRole({
              userId,
              keycloakUserId,
              roleName: selectedRoleName,
              comment,
            })
            if (!('error' in result)) closeAssign()
          }}
        >
          <div className="flex flex-col gap-2">
            <Label htmlFor="assign-role-select">Role</Label>
            <Select value={selectedRoleName} onValueChange={setSelectedRoleName}>
              <SelectTrigger id="assign-role-select">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {assignable.map((role) => (
                  <SelectItem key={role.id} value={role.name}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </ReasonDialog>
      )}

      {revoking && (
        <ReasonDialog
          title={`Revoke ${revoking.name}?`}
          description="The user loses this role's permissions on their next token refresh."
          confirmLabel="Revoke"
          destructive
          pending={revokeState.isLoading}
          error={revokeState.error}
          onClose={() => {
            setRevoking(null)
            revokeState.reset()
          }}
          onConfirm={async (comment) => {
            const result = await revokeRole({
              userId,
              keycloakUserId,
              roleName: revoking.name,
              comment,
            })
            if (!('error' in result)) setRevoking(null)
          }}
        />
      )}
    </div>
  )
}
