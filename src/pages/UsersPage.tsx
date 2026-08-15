import { useState } from 'react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { UserRolesPanel } from '@/components/UserRolesPanel'
import { useHasPermission } from '@/hooks/usePermissions'
import { useSearchUsersQuery } from '@/api/usersApi'
import { useGetStakeholderLinksForUserQuery } from '@/api/stakeholderLinksApi'

function UserLinkedAccounts({ userId }: { userId: string }) {
  const { data: links, isLoading } = useGetStakeholderLinksForUserQuery(userId)

  if (isLoading) return <p className="text-muted-foreground text-xs">Loading linked accounts…</p>
  if (!links || links.length === 0) {
    return <p className="text-muted-foreground text-xs">No linked stakeholder accounts.</p>
  }

  return (
    <ul className="flex flex-col gap-1">
      {links.map((link) => (
        <li key={link.id} className="text-xs">
          <span className="font-medium">{link.stakeholderType}</span>
          <span className="text-muted-foreground"> — {link.externalUsername}, linked {new Date(link.linkedAt).toLocaleDateString()}</span>
        </li>
      ))}
    </ul>
  )
}

export function UsersPage() {
  const { data, isLoading, isError } = useSearchUsersQuery()
  // Presentation only, as everywhere else: it keeps a USER_READ-but-not-ROLES_MANAGE caller from
  // firing per-user role queries that the backend would answer with 403 anyway.
  const canManageRoles = useHasPermission('ROLES_MANAGE')
  // Controlled (not "collapsible" uncontrolled) specifically so a closed row's linked-accounts
  // query never even mounts, let alone fires - see the conditional render inside AccordionContent
  // below. Radix's AccordionContent otherwise keeps a closed panel's children in the DOM
  // (animates height via CSS, doesn't unmount them), which would fire every row's query on load.
  const [openUserId, setOpenUserId] = useState<string | undefined>(undefined)

  return (
    <div className="flex h-full flex-col p-6">
      <Card className="flex flex-1 flex-col">
        <CardHeader>
          <CardTitle>Users</CardTitle>
        </CardHeader>
        <CardContent className="flex-1">
          {isLoading && <p className="text-muted-foreground text-sm">Loading…</p>}
          {isError && <p className="text-destructive text-sm">Failed to load users.</p>}
          {data && data.content.length === 0 && (
            <p className="text-muted-foreground text-sm">No users found.</p>
          )}
          {data && data.content.length > 0 && (
            <Accordion
              type="single"
              collapsible
              value={openUserId}
              onValueChange={(value) => setOpenUserId(value || undefined)}
            >
              {data.content.map((user) => (
                <AccordionItem key={user.id} value={user.id}>
                  <AccordionTrigger>
                    <div className="flex flex-1 items-center justify-between gap-4 pr-2 text-sm font-normal">
                      <span>{user.username}</span>
                      <span className="text-muted-foreground">{user.email}</span>
                      <span className="text-muted-foreground">{user.status}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    {openUserId === user.id && (
                      <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1">
                          <span className="text-xs font-medium">Linked accounts</span>
                          <UserLinkedAccounts userId={user.id} />
                        </div>
                        {canManageRoles && (
                          <UserRolesPanel
                            userId={user.id}
                            keycloakUserId={user.keycloakUserId}
                          />
                        )}
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
