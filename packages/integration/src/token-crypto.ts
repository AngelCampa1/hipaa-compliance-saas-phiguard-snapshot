const encoder = new TextEncoder()

const KEY_CONFIGS = [
  {
    keyIdEnv: 'AUTH_TOKEN_KEY_ID',
    legacyKeyIdEnv: 'KMS_AUTH_KEY_ID',
    secretEnv: 'AUTH_TOKEN_ENCRYPTION_KEY',
  },
  {
    keyIdEnv: 'INTEGRATION_TOKEN_KEY_ID',
    legacyKeyIdEnv: 'INTEGRATION_KMS_KEY_ID',
    secretEnv: 'INTEGRATION_TOKEN_ENCRYPTION_KEY',
  },
] as const

export interface EncryptedToken {
  ciphertext: string
  encryptedDataKey: string
  iv: string
}

type ResolvedKeyConfig = {
  keyId: string
  secret: string
}

function getConfiguredKeyConfigs(): ResolvedKeyConfig[] {
  return KEY_CONFIGS.flatMap((config) => {
    const keyId = process.env[config.keyIdEnv] ?? process.env[config.legacyKeyIdEnv]
    const secret = process.env[config.secretEnv]

    if (!keyId || !secret) {
      return []
    }

    return [{ keyId, secret }]
  })
}

function resolveKeyConfig(keyId: string): ResolvedKeyConfig {
  const configured = getConfiguredKeyConfigs()
  const exact = configured.find((item) => item.keyId === keyId)
  if (exact) {
    return exact
  }

  if (configured.length === 1) {
    return configured[0]
  }

  throw new Error(`No encryption key is configured for token key id ${keyId}`)
}

async function importKey(secret: string) {
  const digest = await crypto.subtle.digest('SHA-256', encoder.encode(secret))
  return crypto.subtle.importKey('raw', digest, 'AES-GCM', false, ['encrypt', 'decrypt'])
}

function toBase64(value: ArrayBuffer | Uint8Array) {
  const bytes = value instanceof Uint8Array ? value : new Uint8Array(value)
  return Buffer.from(bytes).toString('base64')
}

function fromBase64(value: string) {
  return Uint8Array.from(Buffer.from(value, 'base64'))
}

export async function encryptToken(plaintext: string, keyId: string): Promise<EncryptedToken> {
  const config = resolveKeyConfig(keyId)
  const key = await importKey(config.secret)
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const ciphertext = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv,
    },
    key,
    encoder.encode(plaintext),
  )

  return {
    ciphertext: toBase64(ciphertext),
    encryptedDataKey: config.keyId,
    iv: toBase64(iv),
  }
}

export async function decryptToken(encrypted: EncryptedToken): Promise<string> {
  const config = resolveKeyConfig(encrypted.encryptedDataKey)
  const key = await importKey(config.secret)
  const plaintext = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: fromBase64(encrypted.iv),
    },
    key,
    fromBase64(encrypted.ciphertext),
  )

  return new TextDecoder().decode(plaintext)
}
