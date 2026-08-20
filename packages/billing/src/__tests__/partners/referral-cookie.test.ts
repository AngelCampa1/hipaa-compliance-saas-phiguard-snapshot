import { describe, it, expect } from 'vitest'
import { parseReferralCodeFromCookies, buildReferralCookieHeader, REFERRAL_COOKIE_NAME, REFERRAL_COOKIE_MAX_AGE } from '../../partners/referral-cookie.js'

describe('parseReferralCodeFromCookies', () => {
  it('extracts referral code from cookie header', () => {
    expect(parseReferralCodeFromCookies(`pg_ref=PARTNER123; session=abc`)).toBe('PARTNER123')
  })
  it('returns null when cookie absent', () => {
    expect(parseReferralCodeFromCookies('session=abc')).toBeNull()
    expect(parseReferralCodeFromCookies(null)).toBeNull()
  })
  it('handles cookie at start of header', () => {
    expect(parseReferralCodeFromCookies('pg_ref=ABC123')).toBe('ABC123')
  })
  it('handles cookie at end of header', () => {
    expect(parseReferralCodeFromCookies('session=xyz; pg_ref=XYZ789')).toBe('XYZ789')
  })
  it('does not match a cookie with pg_ref as suffix of another name', () => {
    expect(parseReferralCodeFromCookies('apg_ref=BAD; pg_ref=GOOD')).toBe('GOOD')
  })
})

describe('buildReferralCookieHeader', () => {
  it('sets HttpOnly flag', () => {
    expect(buildReferralCookieHeader('CODE123')).toContain('HttpOnly')
  })
  it('sets SameSite=Lax', () => {
    expect(buildReferralCookieHeader('CODE123')).toContain('SameSite=Lax')
  })
  it('sets the cookie name and value', () => {
    expect(buildReferralCookieHeader('CODE123')).toContain(`${REFERRAL_COOKIE_NAME}=CODE123`)
  })
  it('sets Max-Age to 90 days', () => {
    expect(buildReferralCookieHeader('CODE123')).toContain(`Max-Age=${REFERRAL_COOKIE_MAX_AGE}`)
  })
})
