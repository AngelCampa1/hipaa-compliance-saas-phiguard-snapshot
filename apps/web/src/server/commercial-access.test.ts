import { describe, expect, it } from 'vitest'
import { assertCommercialProductAccess } from './access.js'

describe('assertCommercialProductAccess', () => {
  it('blocks product access until Terms and BAA are accepted', () => {
    expect(() =>
      assertCommercialProductAccess({
        commercial: {
          plan: 'clinic',
          planStatus: 'trial_pending',
          trialStartedAt: null,
          trialEndsAt: null,
          stripeCustomerId: null,
          stripeSubscriptionId: null,
          baaSignedAt: null,
          termsAcceptedAt: null,
        },
      }),
    ).toThrow('You need to accept the Terms and BAA before using PHIGuard.')
  })

  it('blocks product access until the selected trial is started after legal acceptance', () => {
    expect(() =>
      assertCommercialProductAccess({
        commercial: {
          plan: 'clinic',
          planStatus: 'trial_pending',
          trialStartedAt: null,
          trialEndsAt: null,
          stripeCustomerId: null,
          stripeSubscriptionId: null,
          baaSignedAt: new Date('2026-04-16T12:00:00.000Z'),
          termsAcceptedAt: new Date('2026-04-16T12:00:00.000Z'),
        },
      }),
    ).toThrow('Start the trial before accessing PHIGuard.')
  })

  it('blocks product access after cancellation', () => {
    expect(() =>
      assertCommercialProductAccess({
        commercial: {
          plan: 'clinic',
          planStatus: 'canceled',
          trialStartedAt: new Date('2026-04-01T00:00:00.000Z'),
          trialEndsAt: new Date('2026-05-01T00:00:00.000Z'),
          stripeCustomerId: null,
          stripeSubscriptionId: null,
          baaSignedAt: new Date('2026-04-16T12:00:00.000Z'),
          termsAcceptedAt: new Date('2026-04-16T12:00:00.000Z'),
        },
      }),
    ).toThrow('Billing action required before accessing PHIGuard.')
  })

  it('blocks product access when the accepted Terms or BAA are not current', () => {
    expect(() =>
      assertCommercialProductAccess({
        commercial: {
          plan: 'clinic',
          planStatus: 'active',
          trialStartedAt: new Date('2026-04-01T00:00:00.000Z'),
          trialEndsAt: new Date('2026-05-01T00:00:00.000Z'),
          stripeCustomerId: 'cus_123',
          stripeSubscriptionId: 'sub_123',
          baaSignedAt: new Date('2026-04-16T12:00:00.000Z'),
          termsAcceptedAt: new Date('2026-04-16T12:00:00.000Z'),
          legalCurrent: false,
        },
      }),
    ).toThrow('You need to accept the Terms and BAA before using PHIGuard.')
  })
})
