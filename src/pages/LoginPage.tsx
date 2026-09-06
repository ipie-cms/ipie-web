import { getRuntimeConfig } from '@/lib/runtimeConfig'
import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAppDispatch } from '@/app/hooks'
import { setCredentials } from '@/features/auth/authSlice'
import { useLoginMutation } from '@/api/keycloakApi'
import { createPkcePair } from '@/lib/pkce'

const { keycloakBaseUrl, keycloakRealm, keycloakClientId, keycloakSsoClientId: ssoClientId } =
  getRuntimeConfig()

// One button per wired-up identityProviders[] alias in deploy/keycloak/realm-export.json.
const STAKEHOLDER_SSO_OPTIONS: { alias: string; label: string }[] = [
  { alias: 'ibbi', label: 'Login with IBBI' },
  { alias: 'nclt', label: 'Login with NCLT' },
  { alias: 'nclat', label: 'Login with NCLAT' },
  { alias: 'mca', label: 'Login with MCA' },
  { alias: 'nesl', label: 'Login with NeSL' },
]

/**
 * Full-page redirect (not an axios call, unlike the ROPC form below) into the ipie realm's
 * Authorization Code flow with `kc_idp_hint=<alias>` - Keycloak's own Identity Brokering then
 * redirects on to that pillar's IdP, validates the user there, and (via the custom
 * first-broker-login Authenticator, module ipie-keycloak-spi) resolves back to this same existing
 * ipie account if one is linked. See SsoCallbackPage for the other half of this round trip.
 */
async function redirectToPillarLogin(pillarIdpAlias: string) {
  const { challenge } = await createPkcePair()
  const redirectUri = `${window.location.origin}/sso/callback`
  const params = new URLSearchParams({
    client_id: ssoClientId,
    response_type: 'code',
    scope: 'openid',
    redirect_uri: redirectUri,
    code_challenge: challenge,
    code_challenge_method: 'S256',
    kc_idp_hint: pillarIdpAlias,
  })
  window.location.href = `${keycloakBaseUrl}/realms/${keycloakRealm}/protocol/openid-connect/auth?${params}`
}

// Keeps tsc's noUnusedLocals quiet while the pillar SSO buttons are commented out of the
// form below. Delete these two lines when you uncomment that section.
void STAKEHOLDER_SSO_OPTIONS
void redirectToPillarLogin

export function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [login, { isLoading }] = useLoginMutation()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    try {
      const token = await login({ username, password }).unwrap()
      dispatch(
        setCredentials({
          accessToken: token.access_token,
          refreshToken: token.refresh_token,
          username,
          clientId: keycloakClientId,
        }),
      )
      navigate('/dashboard', { replace: true })
    } catch (err) {
      const status = (err as { status?: number }).status
      setError(
        status === undefined
          ? 'Network error - could not reach the authentication server.'
          : 'Invalid username or password.',
      )
    }
  }

  return (
    <div className="flex min-h-svh items-center justify-center p-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
          <CardDescription>Authenticate against the iPIE Keycloak realm.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                autoComplete="username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Password</Label>
              <PasswordInput
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>
            {error && <p className="text-destructive text-sm">{error}</p>}
            <Button type="submit" disabled={isLoading} className="mt-2">
              {isLoading ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>
          {/* Pillar SSO buttons ("Login with IBBI"/NCLT/NCLAT/MCA/NeSL) - temporarily
              hidden, uncomment to restore.
          <div className="mt-4 flex flex-col gap-2">
            {STAKEHOLDER_SSO_OPTIONS.map(({ alias, label }) => (
              <Button
                key={alias}
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => redirectToPillarLogin(alias)}
              >
                {label}
              </Button>
            ))}
          </div>
          */}
        </CardContent>
      </Card>
    </div>
  )
}
