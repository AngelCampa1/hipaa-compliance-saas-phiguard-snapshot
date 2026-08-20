// Cookie name and helpers for referral attribution
export const REFERRAL_COOKIE_NAME = 'pg_ref'
export const REFERRAL_COOKIE_MAX_AGE = 90 * 24 * 60 * 60 // 90 days in seconds

export function buildReferralCookieHeader(referralCode: string): string {
  return `${REFERRAL_COOKIE_NAME}=${referralCode}; HttpOnly; SameSite=Lax; Max-Age=${REFERRAL_COOKIE_MAX_AGE}; Path=/`
}

export function parseReferralCodeFromCookies(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${REFERRAL_COOKIE_NAME}=([^;\\s]+)`))
  return match?.[1] ?? null
}
