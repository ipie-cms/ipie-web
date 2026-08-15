import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useGetCurrentUserQuery } from '@/api/registrationApi'
import { useGetMyRolesQuery } from '@/api/rolesApi'

export function DashboardPage() {
  const { data: currentUser, isLoading: isLoadingUser } = useGetCurrentUserQuery()
  const isVerified = currentUser?.registrationStatus === 'VERIFIED'
  const { data: roles, isLoading: isLoadingRoles } = useGetMyRolesQuery(undefined, {
    skip: !isVerified,
  })

  return (
    <div className="flex h-full flex-col p-6">
      <Card className="flex flex-1 flex-col">
        <CardHeader>
          <CardTitle>Dashboard</CardTitle>
          <CardDescription>
            {currentUser ? `Welcome, ${currentUser.fullName ?? currentUser.email}` : 'Loading…'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingUser && <p className="text-muted-foreground text-sm">Loading your account…</p>}

          {!isLoadingUser && currentUser && !isVerified && (
            <p className="text-sm font-medium">Please contact administrator.</p>
          )}

          {!isLoadingUser && currentUser && isVerified && (
            <div className="flex flex-col gap-4">
              {isLoadingRoles && (
                <p className="text-muted-foreground text-sm">Loading your roles…</p>
              )}
              {!isLoadingRoles && (!roles || roles.length === 0) && (
                <p className="text-muted-foreground text-sm">No roles assigned yet.</p>
              )}
              {!isLoadingRoles && roles && roles.length > 0 && (
                <ul className="flex flex-col gap-3">
                  {roles.map((role) => (
                    <li key={role.id} className="rounded-md border p-3">
                      <p className="font-medium">{role.name}</p>
                      {role.description && (
                        <p className="text-muted-foreground text-sm">{role.description}</p>
                      )}
                      {role.permissionNames.length > 0 && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          Permissions: {role.permissionNames.join(', ')}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
