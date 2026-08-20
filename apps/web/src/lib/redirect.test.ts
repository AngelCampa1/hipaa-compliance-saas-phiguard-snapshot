import { describe, expect, it } from 'vitest'
import { getSafeRedirectPath } from './redirect'

describe('getSafeRedirectPath', () => {
  it('returns internal application paths', () => {
    expect(
      getSafeRedirectPath('/app/tasks?status=open#details', '/app/dashboard'),
    ).toBe('/app/tasks?status=open#details')
  })

  it('falls back for absolute URLs', () => {
    expect(
      getSafeRedirectPath('https://evil.example/phish', '/app/dashboard'),
    ).toBe('/app/dashboard')
  })

  it('falls back for protocol-relative URLs', () => {
    expect(getSafeRedirectPath('//evil.example/phish', '/app/dashboard')).toBe(
      '/app/dashboard',
    )
  })
})
