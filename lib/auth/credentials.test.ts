import { describe, expect, it } from 'vitest'
import { loginCredentialsSchema, signupCredentialsSchema, signupPasswordSchema } from './credentials'

describe('authentication credentials', () => {
  it('normalizes email addresses before authentication', () => {
    const credentials = loginCredentialsSchema.parse({
      email: '  Owner@Example.COM ',
      password: 'existing-password',
    })

    expect(credentials.email).toBe('owner@example.com')
  })

  it('keeps login compatible with existing eight-character passwords', () => {
    expect(
      loginCredentialsSchema.safeParse({
        email: 'owner@example.com',
        password: '12345678',
      }).success,
    ).toBe(true)
  })

  it.each(['Short1!', 'alllowercase1!', 'ALLUPPERCASE1!', 'MissingNumber!', 'MissingSymbol1'])(
    'rejects weak signup password %s',
    (password) => {
      expect(signupPasswordSchema.safeParse(password).success).toBe(false)
    },
  )

  it('accepts a bounded password with mixed character classes', () => {
    expect(signupPasswordSchema.safeParse('SecurePlan1!').success).toBe(true)
  })

  it('validates and trims signup profile metadata', () => {
    const credentials = signupCredentialsSchema.parse({
      email: ' founder@example.com ',
      password: 'SecurePlan1!',
      fullName: '  Founder Siapin  ',
    })

    expect(credentials).toMatchObject({
      email: 'founder@example.com',
      fullName: 'Founder Siapin',
    })
  })
})
