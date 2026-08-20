import { describe, it, expect, vi, afterEach } from 'vitest'

const mockEncryptToken = vi.fn().mockResolvedValue({
  ciphertext: 'c1ph3r',
  encryptedDataKey: 'k3y',
  iv: '1v',
})

vi.mock('@phiguard/integration/token-crypto', () => ({
  encryptToken: mockEncryptToken,
}))

vi.mock('@phiguard/db/server', () => ({
  getDb: vi.fn(),
  accounts: {},
  sessions: {},
  users: {},
  verifications: {},
  organizations: {},
  memberships: {},
  organizationInvitations: {},
}))
vi.mock('@phiguard/email', () => ({
  sendOrganizationInviteEmail: vi.fn(),
  sendPasswordResetEmail: vi.fn(),
}))

// Import the module after mocks are registered - auth.ts is heavy (better-auth init)
// so we import once at module scope and cache the function.
const { encryptAccountTokens } = await import('../auth.js')

afterEach(() => {
  vi.clearAllMocks()
  delete process.env.AUTH_TOKEN_KEY_ID
  delete process.env.NODE_ENV
})

describe('encryptAccountTokens', () => {
  it('returns account unchanged when AUTH_TOKEN_KEY_ID is not set', async () => {
    const account = { id: 'acc-1', accessToken: 'plain-token', refreshToken: 'plain-refresh' }
    const result = await encryptAccountTokens(account)
    expect(result).toEqual(account)
    expect(mockEncryptToken).not.toHaveBeenCalled()
  })

  it('fails closed in production when token material would be stored without encryption', async () => {
    process.env.NODE_ENV = 'production'
    const account = { id: 'acc-1', accessToken: 'plain-token' }

    await expect(encryptAccountTokens(account)).rejects.toThrow(
      'AUTH_TOKEN_KEY_ID must be set before storing OAuth account tokens',
    )
    expect(mockEncryptToken).not.toHaveBeenCalled()
  })

  it('populates *Enc fields and tokenKmsKeyId when AUTH_TOKEN_KEY_ID is set', async () => {
    process.env.AUTH_TOKEN_KEY_ID = 'worker-key-v1'
    const account = {
      id: 'acc-1',
      accessToken: 'plain-at',
      refreshToken: 'plain-rt',
      idToken: 'plain-id',
    }
    const result = await encryptAccountTokens(account)

    const encPayload = JSON.stringify({ ciphertext: 'c1ph3r', encryptedDataKey: 'k3y', iv: '1v' })
    expect(result.accessTokenEnc).toBe(encPayload)
    expect(result.refreshTokenEnc).toBe(encPayload)
    expect(result.idTokenEnc).toBe(encPayload)
    expect(result.tokenKmsKeyId).toBe('worker-key-v1')
    expect(result.accessToken).toBeNull()
    expect(result.refreshToken).toBeNull()
    expect(result.idToken).toBeNull()
    expect(mockEncryptToken).toHaveBeenCalledTimes(3)
  })

  it('clears all plaintext token columns when any token is encrypted', async () => {
    process.env.AUTH_TOKEN_KEY_ID = 'worker-key-v1'
    const account = { id: 'acc-1', refreshToken: 'rotated-refresh' }
    const result = await encryptAccountTokens(account)

    expect(result.refreshTokenEnc).toBe(
      JSON.stringify({ ciphertext: 'c1ph3r', encryptedDataKey: 'k3y', iv: '1v' }),
    )
    expect(result.accessToken).toBeNull()
    expect(result.refreshToken).toBeNull()
    expect(result.idToken).toBeNull()
    expect(result.tokenKmsKeyId).toBe('worker-key-v1')
  })

  it('skips null/undefined token fields gracefully', async () => {
    process.env.AUTH_TOKEN_KEY_ID = 'worker-key-v1'
    const account: Record<string, unknown> = {
      id: 'acc-1',
      accessToken: null,
      refreshToken: undefined,
    }
    const result = await encryptAccountTokens(account)

    expect(result.accessTokenEnc).toBeUndefined()
    expect(result.tokenKmsKeyId).toBeUndefined()
    expect(mockEncryptToken).not.toHaveBeenCalled()
  })

  it('does not set tokenKmsKeyId when no token fields are present', async () => {
    process.env.AUTH_TOKEN_KEY_ID = 'worker-key-v1'
    const account = { id: 'acc-1', providerId: 'email', password: '$2b$10$hash' }
    const result = await encryptAccountTokens(account)

    expect(result.tokenKmsKeyId).toBeUndefined()
    expect(mockEncryptToken).not.toHaveBeenCalled()
  })
})
