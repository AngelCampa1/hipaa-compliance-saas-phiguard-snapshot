import { beforeEach, describe, expect, it, vi } from 'vitest'

const sendSignupConfirmationEmail = vi.hoisted(() => vi.fn())
const enrollSequencerSequence = vi.hoisted(() => vi.fn())
const db = vi.hoisted(() => {
  const selectLimit = vi.fn()
  const selectWhere = vi.fn(() => ({ limit: selectLimit }))
  const selectFrom = vi.fn(() => ({ where: selectWhere }))
  const select = vi.fn(() => ({ from: selectFrom }))

  const subscriptionReturning = vi.fn()
  const subscriptionOnConflictDoNothing = vi.fn(() => ({
    returning: subscriptionReturning,
  }))
  const subscriptionValues = vi.fn(() => ({
    onConflictDoNothing: subscriptionOnConflictDoNothing,
  }))

  const leadReturning = vi.fn()
  const leadValues = vi.fn(() => ({
    onConflictDoNothing: () => ({ returning: leadReturning }),
  }))

  let insertCount = 0
  const insert = vi.fn(() => {
    insertCount += 1
    if (insertCount === 1) {
      return { values: subscriptionValues }
    }

    return { values: leadValues }
  })

  const updateWhere = vi.fn()
  const updateSet = vi.fn(() => ({ where: updateWhere }))
  const update = vi.fn(() => ({ set: updateSet }))

  return {
    insert,
    leadReturning,
    reset() {
      insertCount = 0
    },
    select,
    selectLimit,
    subscriptionReturning,
    update,
  }
})

vi.mock('@tanstack/react-start', () => ({
  createServerFn: () => ({
    inputValidator: () => ({
      handler: () => vi.fn(),
    }),
  }),
}))

vi.mock('@tanstack/react-start/server', () => ({
  getRequest: vi.fn(),
}))

vi.mock('@phiguard/email', () => ({
  sendSignupConfirmationEmail,
}))

vi.mock('@phiguard/marketing-db/server', async () => {
  const actual = await vi.importActual<typeof import('@phiguard/marketing-db/server')>(
    '@phiguard/marketing-db/server',
  )

  return {
    ...actual,
    getMarketingDb: () => db,
  }
})

vi.mock('./sequencer.js', () => ({
  enrollSequencerSequence,
}))

describe('enrollSignupTrialSequence', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    db.reset()
    db.subscriptionReturning.mockResolvedValue([])
    db.leadReturning.mockResolvedValue([])
    db.selectLimit
      .mockResolvedValueOnce([
        {
          email: 'owner@example.com',
          subscribed: true,
          unsubscribeToken: 'unsubscribe-token',
        },
      ])
      .mockResolvedValueOnce([
        {
          id: 'existing-lead',
          email: 'owner@example.com',
          magnetSlug: 'signup-trial',
          consentMarketingAt: '2026-01-01T00:00:00.000Z',
        },
      ])
  })

  it('does not resend or re-enroll when the signup trial lead already exists', async () => {
    const { enrollSignupTrialSequence } = await import('./signup-trial-sequence.js')

    await enrollSignupTrialSequence({
      email: 'Owner@Example.com',
      name: 'Owner Example',
      sourcePagePath: '/signup',
    })

    expect(sendSignupConfirmationEmail).not.toHaveBeenCalled()
    expect(enrollSequencerSequence).not.toHaveBeenCalled()
  })

  it('retries Sequencer enrollment for an existing lead missing marketing consent', async () => {
    db.selectLimit
      .mockReset()
      .mockResolvedValueOnce([
        {
          email: 'owner@example.com',
          subscribed: true,
          unsubscribeToken: 'unsubscribe-token',
        },
      ])
      .mockResolvedValueOnce([
        {
          id: 'existing-lead',
          email: 'owner@example.com',
          magnetSlug: 'signup-trial',
          consentMarketingAt: null,
        },
      ])

    const { enrollSignupTrialSequence } = await import('./signup-trial-sequence.js')

    await enrollSignupTrialSequence({
      email: 'Owner@Example.com',
      name: 'Owner Example',
      sourcePagePath: '/signup',
    })

    expect(enrollSequencerSequence).toHaveBeenCalledTimes(2)
    expect(sendSignupConfirmationEmail).not.toHaveBeenCalled()
  })

  it('does not resend a signup confirmation without a matching authenticated session email', async () => {
    const { resendSignupConfirmationImpl } = await import('./signup-trial-sequence.js')

    await resendSignupConfirmationImpl({
      email: 'Owner@Example.com',
      request: new Request('https://my.phiguard.app/signup/check-email'),
      sessionEmail: null,
    })

    expect(sendSignupConfirmationEmail).not.toHaveBeenCalled()
  })

  it('does not enroll a signup confirmation for a mismatched authenticated session email', async () => {
    const { enrollSignupTrialSequenceForRequest } = await import('./signup-trial-sequence.js')

    await enrollSignupTrialSequenceForRequest({
      email: 'Owner@Example.com',
      name: 'Owner Example',
      sourcePagePath: '/signup',
      request: new Request('https://my.phiguard.app/signup'),
      sessionEmail: 'attacker@example.com',
    })

    expect(sendSignupConfirmationEmail).not.toHaveBeenCalled()
    expect(enrollSequencerSequence).not.toHaveBeenCalled()
  })

  it('enrolls and sends signup confirmation for a matching authenticated session email', async () => {
    db.leadReturning.mockResolvedValueOnce([
      {
        id: 'new-lead',
        email: 'owner@example.com',
        magnetSlug: 'signup-trial',
      },
    ])

    const { enrollSignupTrialSequenceForRequest } = await import('./signup-trial-sequence.js')

    await enrollSignupTrialSequenceForRequest({
      email: 'Owner@Example.com',
      name: 'Owner Example',
      sourcePagePath: '/signup',
      request: new Request('https://my.phiguard.app/signup'),
      sessionEmail: 'owner@example.com',
    })

    expect(enrollSequencerSequence).toHaveBeenCalledTimes(2)
    expect(sendSignupConfirmationEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        toEmail: 'owner@example.com',
        firstName: 'Owner',
      }),
    )
  })
})
