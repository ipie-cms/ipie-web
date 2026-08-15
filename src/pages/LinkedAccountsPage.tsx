import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  useGetMyStakeholderLinksQuery,
  useInitiateStakeholderLinkMutation,
  type StakeholderType,
} from '@/api/stakeholderLinksApi'

const STAKEHOLDER_TYPES: { type: StakeholderType; label: string }[] = [
  { type: 'IBBI', label: 'IBBI' },
  { type: 'NCLT', label: 'NCLT' },
  { type: 'NCLAT', label: 'NCLAT' },
  { type: 'MCA', label: 'MCA' },
  { type: 'NESL', label: 'NeSL' },
]

export function LinkedAccountsPage() {
  const { data: links, isLoading } = useGetMyStakeholderLinksQuery()
  const [initiateLink, { isLoading: isInitiating }] = useInitiateStakeholderLinkMutation()

  const linkedTypes = new Set(links?.map((link) => link.stakeholderType))

  async function handleLink(stakeholderType: StakeholderType) {
    const result = await initiateLink(stakeholderType).unwrap()
    window.location.href = result.authorizationUrl
  }

  return (
    <div className="flex h-full flex-col p-6">
      <Card className="flex flex-1 flex-col">
        <CardHeader>
          <CardTitle>Linked stakeholder accounts</CardTitle>
          <CardDescription>
            Link your IBBI, NCLT, NCLAT, or MCA account so you can also sign in with those credentials.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && <p className="text-muted-foreground text-sm">Loading…</p>}
          {!isLoading && (
            <ul className="flex flex-col gap-3">
              {STAKEHOLDER_TYPES.map(({ type, label }) => {
                const existing = links?.find((link) => link.stakeholderType === type)
                return (
                  <li key={type} className="flex items-center justify-between rounded-md border p-3">
                    <div>
                      <p className="font-medium">{label}</p>
                      {existing && (
                        <p className="text-muted-foreground text-sm">
                          Linked to {existing.externalUsername}
                        </p>
                      )}
                    </div>
                    {!linkedTypes.has(type) && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={isInitiating}
                        onClick={() => handleLink(type)}
                      >
                        Link account
                      </Button>
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
