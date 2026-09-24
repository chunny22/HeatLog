import { describe, expect, it } from 'vitest'
import { interpretSignUp } from './signUpResult'

describe('interpretSignUp', () => {
  it('treats a brand-new sign-up as success', () => {
    expect(interpretSignUp({ user: { identities: [{ id: 'a' }] } }, null)).toEqual({ error: null })
  })

  it('flags an existing email when Supabase returns a user with no identities', () => {
    expect(interpretSignUp({ user: { identities: [] } }, null)).toEqual({ error: null, emailTaken: true })
  })

  it('flags an existing email when Supabase returns an "already registered" error', () => {
    expect(interpretSignUp(null, { message: 'User already registered' })).toEqual({ error: null, emailTaken: true })
    expect(interpretSignUp(null, { message: 'A user with this email address has already been registered' })).toEqual({
      error: null,
      emailTaken: true,
    })
  })

  it('passes other errors through unchanged', () => {
    expect(interpretSignUp(null, { message: 'Password should be at least 6 characters' })).toEqual({
      error: 'Password should be at least 6 characters',
    })
  })

  it('does not mistake a missing identities field for an existing account', () => {
    expect(interpretSignUp({ user: {} }, null)).toEqual({ error: null })
    expect(interpretSignUp({ user: null }, null)).toEqual({ error: null })
    expect(interpretSignUp(null, null)).toEqual({ error: null })
  })
})
