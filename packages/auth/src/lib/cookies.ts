export function shouldUseSecureCookies(): boolean {
  // Production always forces secure cookies regardless of URL configuration.
  if (process.env.PLAYWRIGHT === 'true' && hasLocalPlaywrightHttpOrigin()) return false
  if (process.env.NODE_ENV === 'production') return true

  const candidates = [
    process.env.BETTER_AUTH_URL,
    process.env.APP_URL,
    process.env.PLAYWRIGHT_APP_URL,
    process.env.PLAYWRIGHT_BASE_URL,
  ]

  let hasHttpsOrigin = false
  let hasNonLocalHttpOrigin = false

  for (const candidate of candidates) {
    if (!candidate) continue
    try {
      const url = new URL(candidate)
      if (url.protocol === 'https:') {
        hasHttpsOrigin = true
      } else if (url.hostname !== 'localhost' && url.hostname !== '127.0.0.1') {
        hasNonLocalHttpOrigin = true
      }
    } catch {
      // Ignore malformed env values.
    }
  }

  if (hasHttpsOrigin) return true
  if (hasNonLocalHttpOrigin) return false
  return false
}

export function getBetterAuthCookieName(name: string): string {
  return `${shouldUseSecureCookies() ? '__Secure-' : ''}better-auth.${name}`
}

function hasLocalPlaywrightHttpOrigin() {
  const candidates = [
    process.env.PLAYWRIGHT_APP_URL,
    process.env.PLAYWRIGHT_BASE_URL,
  ]

  for (const candidate of candidates) {
    if (!candidate) continue
    try {
      const url = new URL(candidate)
      if (
        url.protocol === 'http:' &&
        (url.hostname === 'localhost' || url.hostname === '127.0.0.1')
      ) {
        return true
      }
    } catch {
      // Ignore malformed env values.
    }
  }

  return false
}
