import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { logout } from '@/features/auth/authSlice'
import {
  useSessionStatusQuery,
  useExtendSessionMutation,
  useEndSessionMutation,
} from '@/api/sessionApi'

// Polls common-session's GET /api/v1/session/status (ipie-common-libs/common-session) at a fixed
// cadence - short enough that the "stay logged in?" prompt below appears promptly once the
// backend's idle timeout enters its warning window, without hammering the endpoint. The backend
// is the single source of truth for both the idle timeout and the warning threshold; this
// component only reacts to what it reports.
const POLL_INTERVAL_MS = 10_000

/**
 * Renders nothing by itself until the backend-reported session enters its warning window, then
 * shows a "stay logged in?" prompt with a live countdown - mirrors common-session's contract:
 * responding "stay logged in" calls {@code POST /api/v1/session/extend}; not responding before the
 * countdown reaches zero, or explicitly choosing "log out", ends the session both server-side
 * ({@code POST /api/v1/session/logout}) and client-side (clearing the stored tokens and
 * redirecting to {@code /login}). Mount once, only while authenticated (see {@code App.tsx}) -
 * inert (query skipped) otherwise.
 */
export function SessionTimeoutGuard() {
  const accessToken = useAppSelector((state) => state.auth.accessToken)
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [extendSession] = useExtendSessionMutation()
  const [endSession] = useEndSessionMutation()
  const [countdownSeconds, setCountdownSeconds] = useState<number | null>(null)

  const { data: status } = useSessionStatusQuery(undefined, {
    skip: !accessToken,
    pollingInterval: POLL_INTERVAL_MS,
  })

  const inWarningWindow =
    status !== undefined &&
    status.active &&
    status.remainingSeconds <= status.warningThresholdSeconds

  // Once the warning window is first entered, count down locally (independent of the next poll)
  // so the displayed number ticks every second instead of jumping only every POLL_INTERVAL_MS.
  useEffect(() => {
    if (!inWarningWindow || status === undefined) {
      setCountdownSeconds(null)
      return
    }
    setCountdownSeconds(status.remainingSeconds)
    const interval = setInterval(() => {
      setCountdownSeconds((current) => (current === null ? null : Math.max(0, current - 1)))
    }, 1000)
    return () => clearInterval(interval)
    // Deliberately keyed only on inWarningWindow, not status.remainingSeconds - re-running this
    // effect on every poll would restart the per-second countdown and undo its own smoothing.
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [inWarningWindow])

  const performLogout = useCallback(async () => {
    try {
      await endSession().unwrap()
    } catch {
      // Best-effort - the client-side logout below must proceed even if the server call fails
      // (e.g. the session already expired server-side, or a transient network error).
    }
    dispatch(logout())
    navigate('/login', { replace: true })
  }, [dispatch, endSession, navigate])

  useEffect(() => {
    if (countdownSeconds === 0) {
      void performLogout()
    }
  }, [countdownSeconds, performLogout])

  if (!accessToken || !inWarningWindow || countdownSeconds === null) {
    return null
  }

  async function handleStayLoggedIn() {
    await extendSession().unwrap()
    setCountdownSeconds(null)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Still there?</CardTitle>
          <CardDescription>
            Your session will expire in {countdownSeconds} second{countdownSeconds === 1 ? '' : 's'}{' '}
            due to inactivity.
          </CardDescription>
        </CardHeader>
        <CardContent />
        <CardFooter className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => void performLogout()}>
            Log out
          </Button>
          <Button onClick={() => void handleStayLoggedIn()}>Stay logged in</Button>
        </CardFooter>
      </Card>
    </div>
  )
}
