import { describe, expect, it } from 'vitest'
import {
  getSignupCheckEmailContinuePath,
  validateSignupCheckEmailSearch,
} from './signup.check-email.js'

describe('signup check-email route', () => {
  it('carries a valid plan to the default onboarding continue link', () => {
    const search = validateSignupCheckEmailSearch({
      email: 'owner@example.com',
      plan: 'clinic',
    })

    expect(getSignupCheckEmailContinuePath(search)).toBe('/app/onboarding?plan=clinic')
  })

  it('keeps explicit safe redirects as the continue link destination', () => {
    const search = validateSignupCheckEmailSearch({
      redirect: '/app/tasks?status=open',
      plan: 'clinic',
    })

    expect(getSignupCheckEmailContinuePath(search)).toBe('/app/tasks?status=open')
  })
})
