export interface AuthResult {
  error: string | null
  /** True when the email already belongs to an account (sign-up only). */
  emailTaken?: boolean
}

const ALREADY_REGISTERED = /already\s+(been\s+)?(registered|exists)/i

/**
 * Turns Supabase's sign-up response into something the form can act on.
 *
 * With "Confirm email" on (the default), signing up an address that already has
 * an account is not an error: to avoid leaking who is registered, Supabase
 * returns a user with an empty `identities` list and sends no email. With it
 * off, Supabase returns a "User already registered" error instead. Both mean
 * the same thing here.
 */
export function interpretSignUp(
  data: { user: { identities?: unknown[] | null } | null } | null,
  error: { message: string } | null,
): AuthResult {
  if (error) {
    return ALREADY_REGISTERED.test(error.message)
      ? { error: null, emailTaken: true }
      : { error: error.message }
  }

  const identities = data?.user?.identities
  if (Array.isArray(identities) && identities.length === 0) {
    return { error: null, emailTaken: true }
  }

  return { error: null }
}
