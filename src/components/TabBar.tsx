import type { MouseEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { X } from 'lucide-react'

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { closeTab } from '@/features/tabs/tabsSlice'

const DEFAULT_TAB_PATH = '/dashboard'

/** Row of currently-open tabs across the top of the dashboard area - see AppLayout. */
export function TabBar() {
  const openTabs = useAppSelector((state) => state.tabs.openTabs)
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  function handleClose(path: string, event: MouseEvent) {
    // Stops the click from also bubbling up into TabsTrigger's own onClick (which would
    // otherwise navigate to the tab being closed, right before it disappears).
    event.stopPropagation()
    const closingIndex = openTabs.findIndex((tab) => tab.path === path)
    dispatch(closeTab({ path }))

    if (location.pathname !== path) return
    // Closing the active tab - land on the tab to its left, or the one that takes its place, or
    // the default dashboard tab if this was the last one open.
    const remaining = openTabs.filter((tab) => tab.path !== path)
    const next = remaining[Math.max(closingIndex - 1, 0)]
    navigate(next ? next.path : DEFAULT_TAB_PATH)
  }

  if (openTabs.length === 0) return null

  return (
    <Tabs value={location.pathname} onValueChange={(path) => navigate(path)} className="gap-0">
      <TabsList variant="line" className="h-auto w-full justify-start rounded-none border-b bg-transparent p-0">
        {openTabs.map((tab) => (
          <TabsTrigger
            key={tab.path}
            value={tab.path}
            // Overrides the base TabsTrigger's flex-1/justify-center (built for a small, fixed
            // set of evenly-spaced tabs) - here tabs accumulate one at a time and must size to
            // their own label, packed from the left, not stretch to fill the bar and center
            // their text once they're the only one open.
            className="flex-none justify-start gap-2 rounded-none px-4 py-2"
          >
            {tab.label}
            <X className="h-3.5 w-3.5 opacity-60 hover:opacity-100" onClick={(event) => handleClose(tab.path, event)} />
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}
