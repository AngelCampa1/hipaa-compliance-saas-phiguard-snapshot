import { logger } from '@phiguard/audit'

const SITEVERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'

let warnedAboutMissingSecret = false

export interface TurnstileVerifyResult {
  success: boolean
  /** True when verification was skipped because no secret is configured outside production. */
  bypassed: boolean
}

interface SiteverifyResponse {
  success: boolean
  'error-codes'?: string[]
}

export async function verifyTurnstile(
  token: string | undefined,
  remoteIp?: string,
): Promise<TurnstileVerifyResult> {
  const secret = process.env.TURNSTILE_SECRET_KEY

  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      if (!warnedAboutMissingSecret) {
        warnedAboutMissingSecret = true
        logger.error(
          'TURNSTILE_SECRET_KEY is unset in production; lead-capture Turnstile verification is failing closed.',
        )
      }
      return { success: false, bypassed: false }
    }

    if (!warnedAboutMissingSecret) {
      warnedAboutMissingSecret = true
      logger.warn('TURNSTILE_SECRET_KEY is unset outside production; verification is bypassing.')
    }
    return { success: true, bypassed: true }
  }

  if (!token) {
    return { success: false, bypassed: false }
  }

  const body = new URLSearchParams({ secret, response: token })
  if (remoteIp) {
    body.set('remoteip', remoteIp)
  }

  try {
    const response = await fetch(SITEVERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    })

    if (!response.ok) {
      return { success: false, bypassed: false }
    }

    const result = (await response.json()) as SiteverifyResponse
    return { success: result.success === true, bypassed: false }
  } catch {
    return { success: false, bypassed: false }
  }
}
