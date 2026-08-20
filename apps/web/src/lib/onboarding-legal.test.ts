import { describe, expect, it } from 'vitest'
import { validateOnboardingLegalStep } from './onboarding-legal.js'

describe('validateOnboardingLegalStep', () => {
  it('requires signer and entity fields before legal acceptance can submit', () => {
    const result = validateOnboardingLegalStep({
      hasOrganization: true,
      clinicName: '',
      customerEntityName: '',
      signerName: '',
      signerTitle: '',
      acceptTerms: true,
      acceptBaa: true,
      requiresLegalAcceptance: true,
    })

    expect(result.isValid).toBe(false)
    expect(result.missingItems).toEqual([
      'Customer legal entity name',
      'Signer full name',
      'Signer title',
    ])
    expect(result.firstInvalidField).toBe('customerEntityName')
  })

  it('names missing Terms and BAA acceptance separately', () => {
    const result = validateOnboardingLegalStep({
      hasOrganization: false,
      clinicName: '',
      customerEntityName: 'Riverside Family Practice, PLLC',
      signerName: 'Jane Smith',
      signerTitle: 'Practice Administrator',
      acceptTerms: false,
      acceptBaa: false,
      requiresLegalAcceptance: true,
    })

    expect(result.isValid).toBe(false)
    expect(result.missingItems).toEqual([
      'Clinic name',
      'Terms of Service acceptance',
      'Business Associate Agreement acceptance',
    ])
    expect(result.firstInvalidField).toBe('clinicName')
  })

  it('does not require legal signer fields when legal acceptance is already current', () => {
    const result = validateOnboardingLegalStep({
      hasOrganization: true,
      clinicName: '',
      customerEntityName: '',
      signerName: '',
      signerTitle: '',
      acceptTerms: false,
      acceptBaa: false,
      requiresLegalAcceptance: false,
    })

    expect(result).toEqual({
      isValid: true,
      missingItems: [],
      fieldErrors: {},
      firstInvalidField: null,
    })
  })
})
