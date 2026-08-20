import { scrypt } from '@noble/hashes/scrypt.js'

const PBKDF2_CONFIG = {
  algorithm: 'PBKDF2',
  hash: 'SHA-256',
  iterations: 310_000,
  dkLen: 32,
}

const LEGACY_SCRYPT_CONFIG = {
  N: 16384,
  r: 16,
  p: 1,
  dkLen: 64,
  maxmem: 128 * 16384 * 16 * 2,
}

function getCrypto() {
  const cryptoImpl = globalThis.crypto
  if (!cryptoImpl?.subtle) {
    throw new Error('Web Crypto PBKDF2 support is required')
  }

  return cryptoImpl
}

function toBase64Url(bytes: Uint8Array) {
  let binary = ''
  for (const byte of bytes) {
    binary += String.fromCharCode(byte)
  }

  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '')
}

function fromBase64Url(value: string) {
  const padding = '='.repeat((4 - (value.length % 4)) % 4)
  const base64 = `${value}${padding}`.replaceAll('-', '+').replaceAll('_', '/')
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index)
  }

  return bytes
}

function fromHex(value: string) {
  if (!/^[0-9a-f]+$/i.test(value) || value.length % 2 !== 0) {
    return null
  }

  const bytes = new Uint8Array(value.length / 2)
  for (let index = 0; index < value.length; index += 2) {
    bytes[index / 2] = Number.parseInt(value.slice(index, index + 2), 16)
  }

  return bytes
}

function toArrayBuffer(bytes: Uint8Array) {
  const copy = new Uint8Array(bytes.byteLength)
  copy.set(bytes)
  return copy.buffer
}

async function deriveKey(password: string, salt: Uint8Array, iterations: number) {
  const cryptoImpl = getCrypto()
  const material = await cryptoImpl.subtle.importKey(
    'raw',
    new TextEncoder().encode(password.normalize('NFKC')),
    PBKDF2_CONFIG.algorithm,
    false,
    ['deriveBits'],
  )
  const bits = await cryptoImpl.subtle.deriveBits(
    {
      name: PBKDF2_CONFIG.algorithm,
      hash: PBKDF2_CONFIG.hash,
      salt: toArrayBuffer(salt),
      iterations,
    },
    material,
    PBKDF2_CONFIG.dkLen * 8,
  )

  return new Uint8Array(bits)
}

function constantTimeEqual(left: Uint8Array, right: Uint8Array) {
  if (left.length !== right.length) {
    return false
  }

  let diff = 0
  for (let index = 0; index < left.length; index += 1) {
    diff |= left[index] ^ right[index]
  }

  return diff === 0
}

function verifyLegacyScryptPassword(hash: string, password: string) {
  const [salt, key, extra] = hash.split(':')
  if (!salt || !key || extra !== undefined) {
    return false
  }

  const storedKey = fromHex(key)
  if (!storedKey || storedKey.length !== LEGACY_SCRYPT_CONFIG.dkLen) {
    return false
  }

  try {
    const derivedKey = scrypt(password.normalize('NFKC'), salt, LEGACY_SCRYPT_CONFIG)
    return constantTimeEqual(storedKey, derivedKey)
  } catch {
    return false
  }
}

export async function hashCredentialPassword(password: string) {
  const salt = new Uint8Array(16)
  getCrypto().getRandomValues(salt)
  const key = await deriveKey(password, salt, PBKDF2_CONFIG.iterations)
  return `pbkdf2-sha256$${PBKDF2_CONFIG.iterations}$${toBase64Url(salt)}$${toBase64Url(key)}`
}

export async function verifyCredentialPassword(hash: string, password: string) {
  if (hash.includes(':')) {
    return verifyLegacyScryptPassword(hash, password)
  }

  const [algorithm, iterationsValue, saltValue, keyValue, extra] = hash.split('$')
  if (
    algorithm !== 'pbkdf2-sha256' ||
    !iterationsValue ||
    !saltValue ||
    !keyValue ||
    extra !== undefined
  ) {
    return false
  }

  const iterations = Number(iterationsValue)
  if (iterations !== PBKDF2_CONFIG.iterations) {
    return false
  }

  try {
    const derivedKey = await deriveKey(password, fromBase64Url(saltValue), iterations)
    return constantTimeEqual(fromBase64Url(keyValue), derivedKey)
  } catch {
    return false
  }
}
