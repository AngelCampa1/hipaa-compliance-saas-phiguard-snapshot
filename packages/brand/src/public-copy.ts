import { PHIGUARD_SIGNUP_URL } from './identity.js'

export const PHIGUARD_PUBLIC_COMMERCIAL_COPY = {
  pricingModel: 'PHIGuard uses flat per-clinic pricing rather than per-user fees.',
  baaIncluded: 'A Business Associate Agreement is included on every public plan.',
  trial: 'The primary trial path is a 30-day free trial with no credit card required.',
  trialNoCard: 'No credit card required. Add billing details later if you want service to continue after the trial.',
} as const

export const PHIGUARD_EMAIL_PUBLIC_COPY = {
  footerReasons: {
    accountCreated: 'You are receiving this because an account was created for this email address.',
    trialAccount: 'You are receiving this because you created a PHIGuard account.',
    leadMagnet: 'You received this email because you requested a free resource at phiguard.app.',
    leadMagnetWithTitlePrefix: 'You received this email because you requested',
    newsletter: 'You received this email because you subscribed at phiguard.app.',
    nurture:
      'You are receiving this because you requested a PHIGuard resource or signed up for product updates.',
  },
  signupConfirmation: {
    preview: 'Your PHIGuard account is ready',
    eyebrow: 'PHIGuard signup',
    defaultGreeting: 'Welcome to PHIGuard',
    personalGreetingPrefix: 'Welcome',
    unsubscribe: 'Unsubscribe',
    body:
      'Your PHIGuard account is ready. Continue setup to choose a plan, review the BAA, and start organizing the clinic compliance work in one auditable workspace.',
    cta: 'Continue setup',
    resendHelp:
      'If this email was hard to find, you can use the resend page to send another copy to the same address.',
    resendLink: 'Resend confirmation',
  },
  trialStarted: {
    subjectSuffix: 'trial started - no card required',
    preview: 'Your 30-day PHIGuard trial is live',
    eyebrow: 'PHIGuard billing',
    headingSuffix: 'trial has started',
    bodyPrefix: 'Your 30-day free trial began on',
    noCardContinuation:
      'No credit card was required to get started. If you want PHIGuard to continue after the trial, add billing details before',
    planLabel: 'Plan',
    trialEndsLabel: 'Trial ends',
    paidPlanLabel: 'Paid plan after trial',
    paidPlanAmountSuffix: 'once billing details are added',
    billingCta: 'Manage billing',
    footer:
      'Keep this email for your records. You can add billing details or manage the plan from your PHIGuard billing page at any time.',
  },
  trialEndingSoon: {
    preview: 'Your PHIGuard trial ends in 3 days',
    eyebrow: 'PHIGuard billing',
    headingSuffix: 'trial ends in 3 days',
    withPaymentPrefix: 'This is a reminder that your trial ends on',
    withPaymentSuffix:
      'Your billing details are already on file, so PHIGuard will continue unless you cancel before the trial ends.',
    withoutPaymentPrefix: 'This is a reminder that your trial ends on',
    withoutPaymentSuffix:
      'Add billing details before then if you want PHIGuard to continue without a pause in service.',
    trialEndDateLabel: 'Trial end date',
    planLabel: 'Plan',
    paidPlanAmountLabel: 'Paid plan amount',
    reviewBillingCta: 'Review billing details',
    addBillingCta: 'Add billing details',
    withPaymentFooter:
      'A payment method is already on file for this subscription. This reminder is tied to your active trial and is not a marketing email.',
    withoutPaymentFooter:
      'If no billing details are added before the trial ends, PHIGuard will pause the subscription until billing is completed. This reminder is tied to your active trial and is not a marketing email.',
  },
  leadMagnet: {
    resourcePreviewPrefix: 'Your free resource from PHIGuard:',
    newsletterPreviewPrefix: 'Welcome to PHIGuard -',
    resourceHeading: 'Here is your free resource',
    welcomeHeading: 'Welcome to PHIGuard',
    requestedPrefix: 'You requested',
    pdfReady:
      'The PDF is ready - the download link below expires in 15 minutes for security. Request a fresh one any time by resubmitting the form on the resource page.',
    resourcePageReady: 'Open the resource page below to access it.',
    downloadPrefix: 'Download',
    pdfSuffix: '(PDF)',
    openPrefix: 'Open',
    newsletterThanksPrefix: 'Thanks for subscribing to',
    browseResourcesCta: 'Browse our free resources',
    resourceHelp:
      'Save the resource locally - share it with your compliance officer or office manager.',
    newsletterHelp:
      'You will receive occasional HIPAA compliance tips and practical guides written for practice administrators at small clinics.',
    productPitch:
      'PHIGuard gives small clinics a HIPAA-native task management system with a BAA available from day one - no enterprise contract, no per-user fees.',
    trialCta: 'Start a 30-day trial',
    trialCtaShort: 'Start 30-day trial',
    trialFinePrint:
      'No credit card required. Start the trial now and add billing details later if you want service to continue after the trial.',
    signupUrl: PHIGUARD_SIGNUP_URL,
  },
  unsubscribe: {
    label: 'Unsubscribe',
    invalidLinkHelp: 'If the unsubscribe link has expired or looks wrong, email support and we will help.',
  },
  invite: {
    previewJoin: 'invited you to join',
    previewSuffix: 'on PHIGuard',
    heading: 'You have been invited to PHIGuard',
    bodyJoin: 'invited you to join',
    rolePrefix: 'on PHIGuard as',
    cta: 'Accept invitation',
    expiresPrefix: 'This invitation expires on',
  },
  passwordReset: {
    preview: 'Reset your PHIGuard password',
    heading: 'Reset your password',
    bodyPrefix:
      'We received a request to reset the password for your PHIGuard account. Click the button below to choose a new password.',
    expiresPrefix: 'This link expires in',
    expiresSuffix: 'minutes.',
    cta: 'Reset password',
    footer:
      'If you did not request a password reset, you can safely ignore this email. Your password will not change.',
  },
  partnerMagicLink: {
    preview: 'Sign in to your PHIGuard Partner Portal',
    heading: 'Sign in to PHIGuard Partner Portal',
    body:
      'Use the button below to sign in to your PHIGuard Partner Portal. This link is valid for 15 minutes.',
    cta: 'Sign in to Partner Portal',
    footer: 'If you did not request this link, you can safely ignore this email.',
  },
  common: {
    teamSignature: 'The PHIGuard Team',
  },
} as const

export const PHIGUARD_PARTNER_PROGRAM_COPY = {
  pageTitle: 'PHIGuard partner program',
  preview: 'Your PHIGuard partner application has been received',
  applicationReceivedHeading: 'Partner application received',
  receivedHeading: 'Application received',
  greetingPrefix: 'Hi',
  thankYou: 'Thank you for applying to the PHIGuard Partner Program.',
  applicationForPrefix: 'We received your application for',
  applicationForSuffix: 'Our team reviews every application and will be in touch within two business days.',
  receivedBody:
    'Thanks for applying to partner with PHIGuard. We will review the details and follow up by email.',
  reviewTiming: 'Most applications receive a response within a few business days.',
  supportQuestion: 'Questions? Email us at',
} as const
