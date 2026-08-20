import { describe, expect, it } from 'vitest'
import { hashCredentialPassword, verifyCredentialPassword } from '../password.js'

describe('credential password helpers', () => {
  const legacyScryptHash =
    '0123456789abcdef0123456789abcdef:b2d470ed628d3246cde885d7a93ad21b0c4460319e10b2965a1adbffc11b26596df36014a164c92dbc8ea1d670ee4982bc7ce94172558de9fb1f13973df43cc0'

  it('hashes and verifies a password', async () => {
    const hash = await hashCredentialPassword('Password123!')

    expect(hash).toMatch(/^pbkdf2-sha256\$310000\$[A-Za-z0-9_-]+\$[A-Za-z0-9_-]+$/)
    await expect(verifyCredentialPassword(hash, 'Password123!')).resolves.toBe(true)
    await expect(verifyCredentialPassword(hash, 'wrong-password')).resolves.toBe(false)
  })

  it('verifies legacy scrypt hashes for existing credential accounts', async () => {
    await expect(verifyCredentialPassword(legacyScryptHash, 'Password123!')).resolves.toBe(true)
    await expect(verifyCredentialPassword(legacyScryptHash, 'wrong-password')).resolves.toBe(false)
  })

  it('fails closed for unsupported hash formats', async () => {
    await expect(verifyCredentialPassword('invalid', 'Password123!')).resolves.toBe(false)
    await expect(verifyCredentialPassword('legacy-salt:legacy-key', 'Password123!')).resolves.toBe(
      false,
    )
    await expect(
      verifyCredentialPassword(
        'pbkdf2-sha256$999999999999$abcdefghijklmnop$abcdefghijklmnop',
        'Password123!',
      ),
    ).resolves.toBe(false)
    await expect(
      verifyCredentialPassword(
        'pbkdf2-sha256$310000$abcdefghijklmnop$abcdefghijklmnop$extra',
        'Password123!',
      ),
    ).resolves.toBe(false)
  })
})
