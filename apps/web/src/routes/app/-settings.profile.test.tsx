import { renderToString } from 'react-dom/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const { deleteAccountFnMock } = vi.hoisted(() => ({
  deleteAccountFnMock: vi.fn(),
}))

vi.mock('@tanstack/react-router', () => ({
  createFileRoute: () => (config: unknown) => ({
    ...(typeof config === 'object' && config ? config : {}),
    useLoaderData: () => ({ userName: 'Taylor' }),
  }),
  useNavigate: () => vi.fn(),
}))

vi.mock('../../server/profile', () => ({
  deleteAccountFn: deleteAccountFnMock,
  updateDisplayNameFn: vi.fn(),
  updateEmailFn: vi.fn(),
  updatePasswordFn: vi.fn(),
}))

vi.mock('../../lib/session.js', () => ({
  getSessionFn: vi.fn(),
}))

vi.mock('../../components/compliance-error-boundary', () => ({
  AppRouteErrorBoundary: () => null,
}))

import { AccountDeletionSection } from './settings.profile'

describe('AccountDeletionSection', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders guarded self-service account deletion controls', () => {
    const html = renderToString(<AccountDeletionSection />)

    expect(html).toContain('Delete account')
    expect(html).toContain('Remove yourself from any organizations')
    expect(html).toContain('Password')
    expect(html).toContain('Type DELETE to confirm')
    expect(html).toContain('disabled=""')
  })
})
