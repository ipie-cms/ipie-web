import { Route, Routes } from 'react-router-dom'

import { LocaleToggle } from '@/components/LocaleToggle'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { AppLayout } from '@/components/AppLayout'
import { SessionTimeoutGuard } from '@/components/SessionTimeoutGuard'
import { LandingPage } from '@/pages/LandingPage'
import { LoginPage } from '@/pages/LoginPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { SetPasswordPage } from '@/pages/SetPasswordPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { UsersPage } from '@/pages/UsersPage'
import { PermissionsPage } from '@/pages/PermissionsPage'
import { RolesPage } from '@/pages/RolesPage'
import { SsoCallbackPage } from '@/pages/SsoCallbackPage'
import { LinkedAccountsPage } from '@/pages/LinkedAccountsPage'
import { NotificationsPage } from '@/pages/NotificationsPage'

function App() {
  return (
    <>
      {/* Inert (its own query is skipped) unless the user is actually authenticated - see its own Javadoc-style comment. */}
      <SessionTimeoutGuard />
      <LocaleToggle />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        {/* Unauthenticated by necessity: the visitor has no credentials yet, which is exactly what
            this page exists to fix. The one-time token in the URL is the authorisation. */}
        <Route path="/set-password" element={<SetPasswordPage />} />
        {/* Unauthenticated on arrival (the browser is mid-redirect from Keycloak) - see SsoCallbackPage's own Javadoc-style comment. */}
        <Route path="/sso/callback" element={<SsoCallbackPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/permissions" element={<PermissionsPage />} />
            <Route path="/roles" element={<RolesPage />} />
            <Route path="/linked-accounts" element={<LinkedAccountsPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
          </Route>
        </Route>
      </Routes>
    </>
  )
}

export default App
