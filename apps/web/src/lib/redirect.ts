export function getSafeRedirectPath(
  redirect: string | undefined,
  fallback: string,
) {
  if (!redirect) {
    return fallback
  }

  if (!redirect.startsWith('/') || redirect.startsWith('//')) {
    return fallback
  }

  try {
    const url = new URL(redirect, 'http://phiguard.local')

    if (url.origin !== 'http://phiguard.local') {
      return fallback
    }

    return `${url.pathname}${url.search}${url.hash}`
  } catch {
    return fallback
  }
}
