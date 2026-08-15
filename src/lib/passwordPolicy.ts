/**
 * The frontend's copy of the platform password policy.
 *
 * Mirrors `PasswordPolicy` in ipie-common-libs, which ipie-iam-service enforces on every request
 * that sets a credential. **iam is the control; this is only here so a user is told what is wrong
 * while the form is still in front of them**, rather than filling it in and having a server error
 * relayed back. If the two drift, the visible symptom is a form that accepts a password the server
 * then refuses - so change them together.
 *
 * Note this is no longer mirroring Keycloak's realm policy: Keycloak stores no password at all, so
 * its realm setting governs nothing that this form can reach.
 */
export const PASSWORD_MIN_LENGTH = 12
export const PASSWORD_MAX_LENGTH = 100

/**
 * At least one lower-case letter, one upper-case, one digit and one symbol. Written as independent
 * lookaheads so character order never matters.
 */
export const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{12,100}$/

/** Describes the whole rule rather than the first part that failed - matches the server's message. */
export const PASSWORD_POLICY_MESSAGE =
  'Password must be at least 12 characters and include an upper-case letter, a lower-case letter, a number and a symbol.'

/** `null` when acceptable, otherwise the message to show. */
export function validatePassword(password: string, confirmPassword: string): string | null {
  if (!PASSWORD_PATTERN.test(password)) {
    return PASSWORD_POLICY_MESSAGE
  }
  if (password !== confirmPassword) {
    return 'Passwords do not match.'
  }
  return null
}
