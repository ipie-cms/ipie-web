import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAppDispatch } from '@/app/hooks'
import { setCredentials } from '@/features/auth/authSlice'
import { useExchangeCodeForTokenMutation } from '@/api/keycloakApi'
import { consumeStoredVerifier } from '@/lib/pkce'
import { decodeJwtPayload } from '@/lib/decodeJwt'

const ssoClientId = import.meta.env.VITE_KEYCLOAK_SSO_CLIENT_ID

/**
 * Lands here after LoginPage's redirectToStakeholderLogin round trip completes - exchanges the
 * authorization code (+ the PKCE verifier stashed before the redirect) for tokens, exactly the
 * same public-client Authorization Code flow any OIDC client uses, then stores them via the same
 * authStorage helper the ROPC login path already uses so the rest of the app needs no changes.
 */
export function SsoCallbackPage() {
  const [searchParams] = useSearchParams()
  const [exchangeCodeForToken] = useExchangeCodeForTokenMutation()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const ranOnce = useRef(false)

  useEffect(() => {
    if (ranOnce.current) return
    ranOnce.current = true

    async function completeExchange() {
      const code = searchParams.get('code')
      const oauthError = searchParams.get('error')
      const codeVerifier = consumeStoredVerifier()

      if (oauthError) {
        setError('Login was not completed: ' + oauthError)
        return
      }
      if (!code || !codeVerifier) {
        setError('Missing authorization code or PKCE verifier - please try signing in again.')
        return
      }

      try {
        const token = await exchangeCodeForToken({
          code,
          codeVerifier,
          redirectUri: `${window.location.origin}/sso/callback`,
        }).unwrap()
        const claims = decodeJwtPayload(token.access_token)
        const username = typeof claims.preferred_username === 'string' ? claims.preferred_username : 'unknown'

        dispatch(
          setCredentials({
            accessToken: token.access_token,
            refreshToken: token.refresh_token,
            username,
            clientId: ssoClientId,
          }),
        )
        navigate('/dashboard', { replace: true })
      } catch {
        setError('Sign-in was rejected - this stakeholder account may not be linked to an ipie account yet.')
      }
    }

    void completeExchange()
  }, [searchParams, exchangeCodeForToken, dispatch, navigate])

  return (
    <div className="flex min-h-svh items-center justify-center p-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Signing you in…</CardTitle>
          <CardDescription>Completing stakeholder single sign-on.</CardDescription>
        </CardHeader>
        {error && (
          <CardContent>
            <p className="text-destructive text-sm">{error}</p>
          </CardContent>
        )}
      </Card>
    </div>
  )
}
