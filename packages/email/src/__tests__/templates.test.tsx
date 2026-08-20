import { render } from '@react-email/render'
import { faker } from '@faker-js/faker'
import { createElement } from 'react'
import { describe, expect, it } from 'vitest'
import { LEAD_MAGNETS } from '@phiguard/lead-magnets'
import { LeadMagnetDeliveryEmail } from '../templates/lead-magnet-delivery.js'
import { OrgInviteEmail } from '../templates/org-invite.js'
import { PartnerApplicationEmail } from '../templates/partner-application.js'
import { PartnerMagicLinkEmail } from '../templates/partner-magic-link.js'
import { TrialEndingSoonEmail } from '../templates/trial-ending-soon.js'
import { TrialStartedEmail } from '../templates/trial-started.js'
import { SignupConfirmationEmail } from '../templates/signup-confirmation.js'

faker.seed(42)

const FAKE_URL = 'https://phiguard.app/resources/hipaa-risk-template'
const FAKE_UNSUBSCRIBE = 'https://phiguard.app/unsubscribe?token=abc123'
const FAKE_ACCEPT_URL = 'https://app.phiguard.app/invite/accept?token=xyz'
const FAKE_EXPIRES = new Date('2026-05-01T00:00:00.000Z')
const FAKE_NAME = faker.person.firstName()
const FAKE_COMPANY = faker.company.name()
const FAKE_ORG = faker.company.name()
const FAKE_BILLING_URL = 'https://app.phiguard.app/app/billing'
const LOGO_URL = 'https://phiguard.app/email/logo-horizontal.png'

async function renderTemplate(element: React.ReactElement): Promise<string> {
  return render(element)
}

function decodeRenderedHtml(html: string): string {
  return html.replaceAll('&#x27;', "'").replaceAll('&quot;', '"').replaceAll('&amp;', '&')
}

describe('PartnerMagicLinkEmail', () => {
  it('renders without throwing', async () => {
    const html = await renderTemplate(createElement(PartnerMagicLinkEmail, { magicLinkUrl: FAKE_URL }))
    expect(html).toContain(FAKE_URL)
    expect(html).toContain(LOGO_URL)
    expect(html).toContain('alt="PHIGuard"')
    expect(html.toLowerCase()).toContain('sign in')
  })
})

describe('PartnerApplicationEmail', () => {
  it('contains partner identity details', async () => {
    const html = await renderTemplate(
      createElement(PartnerApplicationEmail, {
        partnerName: FAKE_NAME,
        company: FAKE_COMPANY,
      }),
    )

    expect(html).toContain(FAKE_NAME)
    expect(html).toContain(FAKE_COMPANY)
  })
})

describe('LeadMagnetDeliveryEmail', () => {
  it('contains the download link and an opt-out for PDF resources', async () => {
    const html = await renderTemplate(
      createElement(LeadMagnetDeliveryEmail, {
        magnetTitle: LEAD_MAGNETS[0].title,
        downloadUrl: FAKE_URL,
        unsubscribeUrl: FAKE_UNSUBSCRIBE,
        isResourceDelivery: true,
        isPdf: true,
      }),
    )

    expect(html).toContain(LEAD_MAGNETS[0].title)
    expect(html).toContain(FAKE_URL)
    // Lead-magnet downloaders are enrolled into the follow-up nurture flow on
    // delivery, so this is ongoing marketing email and must carry a working opt-out.
    expect(html).toContain(FAKE_UNSUBSCRIBE)
    expect(html).toContain('Unsubscribe')
    expect(html).not.toContain('You&apos;ll also get')
    expect(html).toContain('Start a 30-day trial')
    expect(html).toContain('No credit card required. Start the trial now and add billing details later if you want service to continue after the trial.')
  })

  it('contains an opt-out for resource fallback links', async () => {
    const html = await renderTemplate(
      createElement(LeadMagnetDeliveryEmail, {
        magnetTitle: LEAD_MAGNETS[0].title,
        downloadUrl: FAKE_URL,
        unsubscribeUrl: FAKE_UNSUBSCRIBE,
        isResourceDelivery: true,
        isPdf: false,
      }),
    )

    expect(html).toContain(`Open ${LEAD_MAGNETS[0].title}`)
    expect(html).toContain(FAKE_URL)
    expect(html).toContain(FAKE_UNSUBSCRIBE)
    expect(html).toContain('Unsubscribe')
  })

  it('contains the resource and unsubscribe links for newsletter signups', async () => {
    const html = await renderTemplate(
      createElement(LeadMagnetDeliveryEmail, {
        magnetTitle: 'HIPAA tips',
        downloadUrl: FAKE_URL,
        unsubscribeUrl: FAKE_UNSUBSCRIBE,
        isResourceDelivery: false,
        isPdf: false,
      }),
    )

    expect(html).toContain('Browse our free resources')
    expect(html).toContain(FAKE_URL)
    expect(html).toContain(FAKE_UNSUBSCRIBE)
    expect(html).toContain('>Unsubscribe<')
  })
})

describe('OrgInviteEmail', () => {
  it('contains invitation details', async () => {
    const html = await renderTemplate(
      createElement(OrgInviteEmail, {
        acceptUrl: FAKE_ACCEPT_URL,
        expiresAt: FAKE_EXPIRES,
        inviterName: FAKE_NAME,
        organizationName: FAKE_ORG,
        role: 'Admin',
      }),
    )

    expect(html).toContain(FAKE_NAME)
    expect(html).toContain(FAKE_ORG)
    expect(html).toContain(FAKE_ACCEPT_URL)
  })
})

describe('Trial emails', () => {
  it('render billing details', async () => {
    const startedHtml = await renderTemplate(
      createElement(TrialStartedEmail, {
        planName: 'Clinic',
        priceMonthly: 249,
        trialStartedAt: new Date('2026-04-16T12:00:00.000Z'),
        trialEndsAt: new Date('2026-05-16T12:00:00.000Z'),
        billingUrl: FAKE_BILLING_URL,
      }),
    )

    const endingHtml = await renderTemplate(
      createElement(TrialEndingSoonEmail, {
        planName: 'Clinic',
        priceMonthly: 249,
        trialEndsAt: new Date('2026-05-16T12:00:00.000Z'),
        billingUrl: FAKE_BILLING_URL,
        hasPaymentMethodOnFile: false,
      }),
    )

    const billingReadyHtml = await renderTemplate(
      createElement(TrialEndingSoonEmail, {
        planName: 'Clinic',
        priceMonthly: 249,
        trialEndsAt: new Date('2026-05-16T12:00:00.000Z'),
        billingUrl: FAKE_BILLING_URL,
        hasPaymentMethodOnFile: true,
      }),
    )

    expect(startedHtml).toContain('Clinic')
    expect(startedHtml).toContain('249')
    expect(startedHtml).toContain(FAKE_BILLING_URL)
    expect(endingHtml).toContain('Clinic')
    expect(endingHtml).toContain('249')
    expect(endingHtml).toContain(FAKE_BILLING_URL)
    expect(endingHtml).toContain('Add billing details')
    expect(billingReadyHtml).toContain('Review billing details')
    expect(billingReadyHtml).toContain('already on file')
  })
})

describe('Signup trial emails', () => {
  it('renders the confirmation email with resend, unsubscribe, and setup CTAs', async () => {
    const html = await renderTemplate(
      createElement(SignupConfirmationEmail, {
        firstName: FAKE_NAME,
        appUrl: 'https://my.phiguard.app/app/onboarding',
        resendUrl: 'https://my.phiguard.app/signup/check-email?email=test%40clinic.com',
        unsubscribeUrl: FAKE_UNSUBSCRIBE,
      }),
    )

    const decodedHtml = decodeRenderedHtml(html)
    expect(decodedHtml).toContain(`Welcome, ${FAKE_NAME}`)
    expect(decodedHtml).toContain('Continue setup')
    expect(html).toContain('https://my.phiguard.app/app/onboarding')
    expect(html).toContain('https://my.phiguard.app/signup/check-email?email=test%40clinic.com')
    expect(html).toContain(FAKE_UNSUBSCRIBE)
    expect(html).toContain('>Unsubscribe<')
    expect(html).not.toContain('PLACEHOLDER')
    expect(decodedHtml.toLowerCase()).not.toContain('patient')
  })

})
