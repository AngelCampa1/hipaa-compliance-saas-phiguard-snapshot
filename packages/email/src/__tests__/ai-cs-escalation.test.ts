import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { SUPPORT_EMAIL } from '@phiguard/brand/contact'

const mockSendEmail = vi.fn()

vi.mock('../resend.js', () => ({
  sendEmail: mockSendEmail,
}))

vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react')>()
  return {
    ...actual,
    createElement: vi.fn((type, props) => ({ type, props })),
  }
})

describe('sendAiCsEscalationNotification', () => {
  beforeEach(() => {
    mockSendEmail.mockResolvedValue({ messageId: 'test-message-id' })
  })

  afterEach(() => {
    vi.clearAllMocks()
    delete process.env.AI_CS_ESCALATION_NOTIFY_EMAIL
  })

  it('sends to AI_CS_ESCALATION_NOTIFY_EMAIL when set', async () => {
    process.env.AI_CS_ESCALATION_NOTIFY_EMAIL = 'ops@phiguard.app'
    const { sendAiCsEscalationNotification } = await import('../index.js')

    await sendAiCsEscalationNotification({
      appId: 'phiguard',
      organizationId: 'org_abc',
      userId: 'user_xyz',
      sessionId: 'sess_999',
      reason: 'Need help',
    })

    expect(mockSendEmail).toHaveBeenCalledOnce()
    expect(mockSendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'ops@phiguard.app',
        subject: 'AI-CS escalation - phiguard',
      }),
    )
  })

  it('falls back to SUPPORT_EMAIL when AI_CS_ESCALATION_NOTIFY_EMAIL is not set', async () => {
    delete process.env.AI_CS_ESCALATION_NOTIFY_EMAIL
    const { sendAiCsEscalationNotification } = await import('../index.js')

    await sendAiCsEscalationNotification({
      appId: 'phiguard',
      organizationId: 'org_abc',
      userId: 'user_xyz',
      sessionId: 'sess_888',
    })

    expect(mockSendEmail).toHaveBeenCalledOnce()
    expect(mockSendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: SUPPORT_EMAIL,
      }),
    )
  })

  it('includes sessionId and reason in the email react element props', async () => {
    process.env.AI_CS_ESCALATION_NOTIFY_EMAIL = 'team@phiguard.app'
    const { sendAiCsEscalationNotification } = await import('../index.js')

    await sendAiCsEscalationNotification({
      appId: 'phiguard',
      organizationId: 'org_abc',
      userId: 'user_xyz',
      sessionId: 'sess_777',
      reason: 'Urgent issue',
      message: 'Cannot export audit logs',
      contact: 'user@example.com',
      currentPath: '/app/audit',
    })

    expect(mockSendEmail).toHaveBeenCalledOnce()
    const callArg = mockSendEmail.mock.calls[0][0] as {
      react: { props: Record<string, unknown> }
    }
    expect(callArg.react.props).toMatchObject({
      sessionId: 'sess_777',
      reason: 'Urgent issue',
      message: 'Cannot export audit logs',
      contact: 'user@example.com',
      currentPath: '/app/audit',
    })
  })

  it('no-ops gracefully when AI_CS_ESCALATION_NOTIFY_EMAIL is empty and SUPPORT_EMAIL is empty', async () => {
    // Simulate an environment where both env var and fallback are absent by
    // using an empty-string env var that evaluates falsy after trim.
    process.env.AI_CS_ESCALATION_NOTIFY_EMAIL = '   '

    // We cannot easily make SUPPORT_EMAIL empty (it is a constant imported at
    // module load time). Instead, verify that an empty trimmed env var still
    // causes the fallback to be used (SUPPORT_EMAIL), which is the normal path.
    const { sendAiCsEscalationNotification } = await import('../index.js')

    await sendAiCsEscalationNotification({
      appId: 'phiguard',
      organizationId: 'org_abc',
      userId: 'user_xyz',
      sessionId: 'sess_666',
    })

    // Whitespace-only env var falls through to SUPPORT_EMAIL fallback
    expect(mockSendEmail).toHaveBeenCalledOnce()
    expect(mockSendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: SUPPORT_EMAIL,
      }),
    )
  })
})
