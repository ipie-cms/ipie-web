import { useEffect } from 'react'
import { useLocation, useNavigate, Outlet } from 'react-router-dom'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useHasPermission } from '@/hooks/usePermissions'
import { useAppDispatch } from '@/app/hooks'
import { openTab } from '@/features/tabs/tabsSlice'
import { TabBar } from '@/components/TabBar'
import { TopBar } from '@/components/TopBar'

interface NavItem {
  to: string
  label: string
  /** Client-side only - decides visibility, never enforcement (that's always server-side). */
  requiredPermission?: string
  /** Opposite of requiredPermission - hidden when the caller *does* hold this permission. */
  hiddenForPermission?: string
}

const NAV_ITEMS: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard' },
  // Self-service "link your own IBBI/NCLT/etc. account" - not applicable to SUPER_ADMIN, a
  // platform operator rather than a pillar linking their own external identity. SUPER_ADMIN
  // instead sees any user's linked accounts cascaded under Users below.
  { to: '/linked-accounts', label: 'Linked accounts', hiddenForPermission: 'SUPER_ADMIN' },
  { to: '/users', label: 'Users', requiredPermission: 'USER_READ' },
  // Two entries, permissions first, because they are two acts in a fixed order: a role can only be
  // composed from permissions that already exist. One combined entry left that ordering to be
  // inferred from the page layout.
  //
  // RBAC_DEFINE, not ROLES_MANAGE: these decide what capabilities exist, which is SUPER_ADMIN's. An
  // admin holding ROLES_MANAGE assigns existing roles to people, from the Users page.
  { to: '/permissions', label: 'Permissions', requiredPermission: 'RBAC_DEFINE' },
  { to: '/roles', label: 'Roles', requiredPermission: 'RBAC_DEFINE' },
  { to: '/notifications', label: 'Notification', requiredPermission: 'NOTIFICATIONS_VIEW' },
]

function NavItemButton({ item }: { item: NavItem }) {
  const hasPermission = useHasPermission(item.requiredPermission ?? '')
  const isHidden = useHasPermission(item.hiddenForPermission ?? '')
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  if (item.requiredPermission && !hasPermission) return null
  if (item.hiddenForPermission && isHidden) return null

  const isActive = location.pathname === item.to

  return (
    <Button
      type="button"
      variant="ghost"
      onClick={() => {
        dispatch(openTab({ path: item.to, label: item.label }))
        navigate(item.to)
      }}
      className={cn('justify-start', isActive && 'bg-accent text-accent-foreground')}
    >
      {item.label}
    </Button>
  )
}

/**
 * Persistent left navigation panel (20% width) + tabbed dashboard area (80%), wrapping every
 * authenticated route. Clicking a nav item opens it as a tab in the dashboard area (TabBar) rather
 * than replacing the page outright - the route still changes underneath (deep links, browser
 * back/forward, and a page refresh all keep working), the tab bar is a visible record of what's
 * open, matching how a desktop app's tabs behave.
 */
export function AppLayout() {
  const location = useLocation()
  const dispatch = useAppDispatch()

  // Landing directly on a route (login redirect, a deep link, a refresh) must still show a tab
  // for it - only NavItemButton's onClick opens a tab otherwise, which never fires in those cases.
  useEffect(() => {
    const matchingNavItem = NAV_ITEMS.find((item) => item.to === location.pathname)
    dispatch(openTab({ path: location.pathname, label: matchingNavItem?.label ?? location.pathname }))
  }, [location.pathname, dispatch])

  return (
    <div className="flex h-svh flex-col">
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        <nav className="w-1/5 shrink-0 overflow-auto border-r p-4">
          <div className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => (
              <NavItemButton key={item.to} item={item} />
            ))}
          </div>
        </nav>
        <div className="flex w-4/5 flex-1 flex-col overflow-hidden">
          <TabBar />
          <main className="flex-1 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
