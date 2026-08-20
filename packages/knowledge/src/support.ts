export { SUPPORT_EMAIL, SUPPORT_EMAIL_FROM, SUPPORT_EMAIL_MAILTO } from '@phiguard/brand/contact'
import { SUPPORT_EMAIL } from '@phiguard/brand/contact'

export const SUPPORT_PHI_WARNING =
  'Please do not email patient names, dates of birth, medical record numbers, or other PHI.'

export const supportHandoffCopy = {
  email: SUPPORT_EMAIL,
  noPhiWarning: SUPPORT_PHI_WARNING,
  summary: 'Ask PHIGuard support for product help without sending patient identifiers or clinical details.',
  handoff: `Email ${SUPPORT_EMAIL} with the page, action, and expected result. Do not include PHI.`,
} as const
