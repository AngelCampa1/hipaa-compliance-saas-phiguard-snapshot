export {
  PHIGUARD_EMAIL_PUBLIC_COPY as emailPublicCopy,
  PHIGUARD_PARTNER_PROGRAM_COPY as partnerProgramCopy,
} from '@phiguard/brand/public-copy'
import { TRIAL_DAYS } from '@phiguard/billing/plans'

export const signupTrialEmailSteps = [
  {
    subject: 'Welcome to PHIGuard',
    body: 'Your account is ready. Continue setup to choose a plan, review the BAA, and start organizing clinic compliance work in one auditable workspace.',
  },
  {
    subject: 'Your PHIGuard trial is live',
    body: `Your ${TRIAL_DAYS}-day free trial is active with no credit card required. Add billing details before the trial ends if you want service to continue without a pause.`,
  },
  {
    subject: 'Keep your HIPAA work moving',
    body: 'Use the trial to centralize recurring compliance tasks, incidents, evidence, and audit trail activity before the trial window closes.',
  },
] as const
