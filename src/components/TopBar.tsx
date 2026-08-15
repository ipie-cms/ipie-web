import { useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { logout } from '@/features/auth/authSlice'

/** Full-width bar above everything else in AppLayout - iPIE logo left, signed-in user + logout right. */
export function TopBar() {
  const username = useAppSelector((state) => state.auth.username)
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  function handleLogout() {
    dispatch(logout())
    navigate('/login', { replace: true })
  }

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b px-4">
      <span className="text-sm font-semibold tracking-wide uppercase">iPIE</span>
      <div className="flex items-center gap-3">
        <span className="text-muted-foreground text-sm">{username}</span>
        <Button type="button" variant="outline" size="sm" onClick={handleLogout}>
          Log out
        </Button>
      </div>
    </header>
  )
}
