import { appPublicGuidanceCopy } from '@phiguard/knowledge/app'

export type OnboardingLegalField =
  | 'clinicName'
  | 'customerEntityName'
  | 'signerName'
  | 'signerTitle'
  | 'acceptTerms'
  | 'acceptBaa'

export interface OnboardingLegalValidationInput {
  hasOrganization: boolean
  clinicName: string
  customerEntityName: string
  signerName: string
  signerTitle: string
  acceptTerms: boolean
  acceptBaa: boolean
  requiresLegalAcceptance: boolean
}

export interface OnboardingLegalValidationResult {
  isValid: boolean
  missingItems: string[]
  fieldErrors: Partial<Record<OnboardingLegalField, string>>
  firstInvalidField: OnboardingLegalField | null
}

const VALID_RESULT: OnboardingLegalValidationResult = {
  isValid: true,
  missingItems: [],
  fieldErrors: {},
  firstInvalidField: null,
}

const legalValidationCopy = appPublicGuidanceCopy.legalValidation

export function validateOnboardingLegalStep(
  input: OnboardingLegalValidationInput,
): OnboardingLegalValidationResult {
  if (!input.requiresLegalAcceptance) {
    return VALID_RESULT
  }

  const fieldErrors: Partial<Record<OnboardingLegalField, string>> = {}
  const missingItems: string[] = []

  function requireField(
    field: OnboardingLegalField,
    label: string,
    value: string | boolean,
    message: string,
  ) {
    const hasValue = typeof value === 'boolean' ? value : value.trim().length > 0
    if (hasValue) return

    fieldErrors[field] = message
    missingItems.push(label)
  }

  if (!input.hasOrganization) {
    requireField(
      'clinicName',
      legalValidationCopy.clinicName.label,
      input.clinicName,
      legalValidationCopy.clinicName.message,
    )
  }

  requireField(
    'customerEntityName',
    legalValidationCopy.customerEntityName.label,
    input.customerEntityName,
    legalValidationCopy.customerEntityName.message,
  )
  requireField(
    'signerName',
    legalValidationCopy.signerName.label,
    input.signerName,
    legalValidationCopy.signerName.message,
  )
  requireField(
    'signerTitle',
    legalValidationCopy.signerTitle.label,
    input.signerTitle,
    legalValidationCopy.signerTitle.message,
  )
  requireField(
    'acceptTerms',
    legalValidationCopy.acceptTerms.label,
    input.acceptTerms,
    legalValidationCopy.acceptTerms.message,
  )
  requireField(
    'acceptBaa',
    legalValidationCopy.acceptBaa.label,
    input.acceptBaa,
    legalValidationCopy.acceptBaa.message,
  )

  return {
    isValid: missingItems.length === 0,
    missingItems,
    fieldErrors,
    firstInvalidField: (Object.keys(fieldErrors)[0] as OnboardingLegalField | undefined) ?? null,
  }
}
