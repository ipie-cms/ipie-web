import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useListNotificationsQuery, type NotificationLogResponse } from '@/api/notificationsApi'

function NotificationDetail({ notification, onBack }: { notification: NotificationLogResponse; onBack: () => void }) {
  return (
    <div className="flex flex-col gap-4">
      <Button type="button" variant="outline" className="w-fit" onClick={onBack}>
        ← Back to list
      </Button>
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-3 text-sm">
        <dt className="text-muted-foreground">Recipient</dt>
        <dd>{notification.recipient}</dd>
        <dt className="text-muted-foreground">Subject</dt>
        <dd>{notification.subject}</dd>
        <dt className="text-muted-foreground">Purpose</dt>
        <dd>{notification.purpose}</dd>
        <dt className="text-muted-foreground">Channel</dt>
        <dd>{notification.channel}</dd>
        <dt className="text-muted-foreground">Status</dt>
        <dd>{notification.status}</dd>
        <dt className="text-muted-foreground">Sent at</dt>
        <dd>{new Date(notification.sentAt).toLocaleString()}</dd>
      </dl>
      <div>
        <p className="text-muted-foreground mb-1 text-sm font-medium">Message</p>
        {notification.body ? (
          <pre className="bg-muted overflow-x-auto rounded-md p-3 text-sm whitespace-pre-wrap">{notification.body}</pre>
        ) : (
          <p className="text-muted-foreground text-sm">
            Sent before message content started being recorded - no body stored for this one.
          </p>
        )}
      </div>
    </div>
  )
}

/**
 * Every notification this platform has ever sent, any recipient - the SUPER_ADMIN-only
 * counterpart to browsing MailHog directly in local dev. Cursor (keyset) pagination, not offset:
 * this table is expected to grow large and high-traffic, so "Load more" always fetches the next
 * page in constant time rather than degrading at depth (see notificationsApi.ts).
 */
export function NotificationsPage() {
  const [cursor, setCursor] = useState<string | undefined>(undefined)
  const [items, setItems] = useState<NotificationLogResponse[]>([])
  const [selected, setSelected] = useState<NotificationLogResponse | null>(null)
  const { data, isLoading, isFetching, error } = useListNotificationsQuery({ cursor })

  useEffect(() => {
    if (!data) return
    // First page (no cursor yet) replaces; every subsequent page appends.
    setItems((previous) => (cursor ? [...previous, ...data.content] : data.content))
  }, [data, cursor])

  const status = (error as { status?: number } | undefined)?.status

  return (
    <div className="flex h-full flex-col p-6">
      <Card className="flex flex-1 flex-col">
        <CardHeader>
          <CardTitle>{selected ? 'Notification' : 'Notifications'}</CardTitle>
          <CardDescription>
            {selected
              ? `Sent to ${selected.recipient}`
              : 'Every email or SMS this platform has sent, to any recipient.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {selected && <NotificationDetail notification={selected} onBack={() => setSelected(null)} />}

          {!selected && (
            <>
              {isLoading && <p className="text-muted-foreground text-sm">Loading…</p>}

              {status === 403 && (
                <p className="text-destructive text-sm">You do not have permission to view this.</p>
              )}
              {error && status !== 403 && (
                <p className="text-destructive text-sm">Could not load notifications - please try again.</p>
              )}

              {!isLoading && !error && items.length === 0 && (
                <p className="text-muted-foreground text-sm">No notifications sent yet.</p>
              )}

              {items.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left">
                        <th className="py-2 pr-4 font-medium">Sent at</th>
                        <th className="py-2 pr-4 font-medium">Recipient</th>
                        <th className="py-2 pr-4 font-medium">Subject</th>
                        <th className="py-2 pr-4 font-medium">Purpose</th>
                        <th className="py-2 pr-4 font-medium">Channel</th>
                        <th className="py-2 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item) => (
                        <tr
                          key={item.id}
                          onClick={() => setSelected(item)}
                          className="hover:bg-accent/50 cursor-pointer border-b last:border-0"
                        >
                          <td className="text-muted-foreground py-2 pr-4 whitespace-nowrap">
                            {new Date(item.sentAt).toLocaleString()}
                          </td>
                          <td className="py-2 pr-4">{item.recipient}</td>
                          <td className="py-2 pr-4">{item.subject}</td>
                          <td className="text-muted-foreground py-2 pr-4">{item.purpose}</td>
                          <td className="text-muted-foreground py-2 pr-4">{item.channel}</td>
                          <td className="py-2">{item.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {data?.hasMore && (
                <Button
                  type="button"
                  variant="outline"
                  className="mt-4"
                  disabled={isFetching}
                  onClick={() => setCursor(data.nextCursor ?? undefined)}
                >
                  {isFetching ? 'Loading…' : 'Load more'}
                </Button>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
