import { logger } from '@phiguard/audit'

let warnedAboutMissingSecret = false
const DEFAULT_CAPTCHA_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'

export interface CaptchaVerifyResult {
  success: boolean
  /** True when verification was skipped because no secret is configured outside production. */
  bypassed: boolean
}

interface SiteverifyResponse {
  success: boolean
  'error-codes'?: string[]
}

export async function verifyCaptcha(
  token: string | undefined,
  remoteIp?: string,
): Promise<CaptchaVerifyResult> {
  const secret = process.env.CAPTCHA_SECRET_KEY || process.env.TURNSTILE_SECRET_KEY
  const siteverifyUrl = process.env.CAPTCHA_VERIFY_URL || DEFAULT_CAPTCHA_VERIFY_URL

  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      if (!warnedAboutMissingSecret) {
        warnedAboutMissingSecret = true
        logger.error(
          'CAPTCHA verification is not configured in production; lead capture verification is failing closed.',
        )
      }
      return { success: false, bypassed: false }
    }

    if (!warnedAboutMissingSecret) {
      warnedAboutMissingSecret = true
      logger.warn('CAPTCHA verification is not configured outside production; verification is bypassing.')
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
    const response = await fetch(siteverifyUrl, {
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
