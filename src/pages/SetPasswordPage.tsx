import { useState, type FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { PasswordInput } from '@/components/ui/password-input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useSetInitialPasswordMutation } from '@/api/credentialApi'
import { PASSWORD_POLICY_MESSAGE, validatePassword } from '@/lib/passwordPolicy'

/**
 * Where the "set your password" email lands.
 *
 * Registration no longer collects a password: the account is provisioned asynchronously and created
 * without credentials, so there is nothing to attach one to at submit time. The registrant chooses
 * theirs here instead, authorised by the single-use token in the link rather than by a session -
 * they have no credentials yet, which is the whole point.
 *
 * Posts to **ipie-iam-service directly**, not through ipie-user-service. iam owns credentials, and
 * routing a plaintext password through a second service would both widen who handles it and put a
 * synchronous cross-service call on a page someone is waiting in front of.
 *
 * Unauthenticated, so it sits outside ProtectedRoute in App.tsx.
 */
export function SetPasswordPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const [setInitialPassword, { isLoading }] = useSetInitialPasswordMutation()
  const navigate = useNavigate()

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)

    const validationError = validatePassword(password, confirmPassword)
    if (validationError) {
      setError(validationError)
      return
    }

    try {
      await setInitialPassword({ token, password }).unwrap()
      setDone(true)
    } catch (submitError) {
      // 422 is the expected failure here and means the link itself is unusable - unknown, expired,
      // or already used. The server deliberately does not distinguish those, so neither does this.
      const status = (submitError as { status?: number })?.status
      setError(
        status === 422
          ? 'This link is no longer valid. It may have expired or already been used. Request a new one from the sign-in page.'
          : 'Something went wrong setting your password. Please try again.',
      )
    }
  }

  // A link with no token at all never came from one of our emails; say so plainly rather than
  // showing a form that cannot possibly succeed.
  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Link not valid</CardTitle>
            <CardDescription>
              This page needs the link from your &ldquo;set your password&rdquo; email. Open that
              link directly, or request a new one from the sign-in page.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => navigate('/login')}>
              Go to sign in
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (done) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Password set</CardTitle>
            <CardDescription>
              You can now sign in with your email address and the password you just chose. Your
              registration still needs to be approved before you get full access.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => navigate('/login')}>
              Go to sign in
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Set your password</CardTitle>
          <CardDescription>
            Choose a password for your iPIE account. This link can be used once.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <Label htmlFor="password" className="mb-1.5 block text-sm font-medium">
                New password
              </Label>
              <PasswordInput
                id="password"
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
              {/* Stated up front rather than only on failure - the rule is strict enough that
                  discovering it by rejection is a poor first experience. */}
              <p className="mt-1.5 text-xs text-gray-600">{PASSWORD_POLICY_MESSAGE}</p>
            </div>

            <div>
              <Label htmlFor="confirmPassword" className="mb-1.5 block text-sm font-medium">
                Confirm password
              </Label>
              <PasswordInput
                id="confirmPassword"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
              />
            </div>

            {error && (
              <p role="alert" className="text-sm text-red-600">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Setting password…' : 'Set password'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
