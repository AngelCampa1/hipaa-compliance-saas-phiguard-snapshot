/**
 * Retrieve a required secret from process.env.
 * Throws at call time if the variable is missing or shorter than 16 chars,
 * preventing silent use of an empty string as a cryptographic key.
 */
function isUsableSecret(value: string | undefined): value is string {
  return typeof value === 'string' && value.length >= 16
}

export function requireSecret(name: string): string {
  const v = process.env[name]
  if (!isUsableSecret(v)) {
    throw new Error(`Required env var ${name} is missing or too short (min 16 chars)`)
  }
  return v
}

export function requireAuthSecret(): string {
  const betterAuthSecret = process.env.BETTER_AUTH_SECRET
  if (isUsableSecret(betterAuthSecret)) {
    return betterAuthSecret
  }

  const legacyAuthSecret = process.env.AUTH_SECRET
  if (isUsableSecret(legacyAuthSecret)) {
    return legacyAuthSecret
  }

  throw new Error(
    'Required env var BETTER_AUTH_SECRET or AUTH_SECRET is missing or too short (min 16 chars)',
  )
}

export function syncBetterAuthSecretEnv() {
  const betterAuthSecret = process.env.BETTER_AUTH_SECRET
  if (isUsableSecret(betterAuthSecret)) {
    return
  }

  const legacyAuthSecret = process.env.AUTH_SECRET
  if (isUsableSecret(legacyAuthSecret)) {
    process.env.BETTER_AUTH_SECRET = legacyAuthSecret
  }
}
