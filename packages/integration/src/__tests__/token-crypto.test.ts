import { describe, it, expect } from 'vitest'
import { encryptToken, decryptToken } from '../token-crypto.js'

describe('encryptToken / decryptToken', () => {
  it('round-trips a token value', async () => {
    process.env.AUTH_TOKEN_KEY_ID = 'worker-key-v1'
    process.env.AUTH_TOKEN_ENCRYPTION_KEY = 'test-auth-encryption-secret-value'
    const plaintext = 'ya29.some-access-token-value'
    const encrypted = await encryptToken(plaintext, 'worker-key-v1')
    expect(encrypted).toHaveProperty('ciphertext')
    expect(encrypted).toHaveProperty('encryptedDataKey')
    expect(encrypted).toHaveProperty('iv')
    expect(encrypted.encryptedDataKey).toBe('worker-key-v1')
    const decrypted = await decryptToken(encrypted)
    expect(decrypted).toBe(plaintext)
  })
})
