import { describe, expect, it } from 'vitest'
import { getPartnerLoginError } from './partner.login'

describe('getPartnerLoginError', () => {
  it('explains invalid partner magic links', () => {
    expect(getPartnerLoginError('invalid-link')).toBe(
      'That partner sign-in link is invalid or expired. Request a new link to continue.',
    )
  })

  it('ignores unknown error codes', () => {
    expect(getPartnerLoginError('unexpected')).toBeNull()
    expect(getPartnerLoginError(undefined)).toBeNull()
  })
})
