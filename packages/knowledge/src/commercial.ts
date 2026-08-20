import { COMMERCIAL_COPY, DEFAULT_BILLING_CADENCE, LIMITED_OFFER_PROMOTIONS, PLANS, TRIAL_DAYS, getPromotionDisplayCopy } from '@phiguard/billing/plans'
import { planNamesSentence } from './marketing.js'

export const commercialPlanSource = {
  defaultCadence: DEFAULT_BILLING_CADENCE,
  plans: PLANS,
  promotions: LIMITED_OFFER_PROMOTIONS,
  copy: COMMERCIAL_COPY,
} as const

const yearlyOffer = LIMITED_OFFER_PROMOTIONS.find((offer) => offer.billingCadence === DEFAULT_BILLING_CADENCE) ?? LIMITED_OFFER_PROMOTIONS[0]
if (!yearlyOffer) {
  throw new Error('Expected at least one public limited offer promotion')
}
const yearlyOfferCopy = getPromotionDisplayCopy(yearlyOffer)
const essentialsPlanName = PLANS.essentials.name
const clinicPlanName = PLANS.clinic.name
const groupPlanName = PLANS.group.name

export const commercialKnowledgeCopy = {
  pricingModel: 'PHIGuard uses flat per-clinic pricing, not per-user fees.',
  baaIncluded: 'A Business Associate Agreement is included on every public plan.',
  trialDays: TRIAL_DAYS,
  trial: `The primary trial path is a ${TRIAL_DAYS}-day free trial with no credit card required.`,
  trialFeature: `${TRIAL_DAYS}-day free trial`,
  promotion: yearlyOfferCopy?.bannerMessage ?? `${yearlyOffer.id} is auto-applied at checkout.`,
  guarantee: COMMERCIAL_COPY.moneyBackGuarantee,
  guaranteeEligibility:
    'Refund eligibility is limited to the first paid subscription period, must be requested within 30 days after the first paid charge, and is available once per customer.',
} as const

export const commercialPageCopy = {
  trialNoCard: 'No credit card required. Add billing details later if you want to keep service after the trial.',
  heroFinePrint:
    'No credit card required. Review and sign the BAA during onboarding before the trial starts. Add billing details later if you want to keep service after the trial.',
  cta: {
    heading: 'Ready to put compliance on solid ground?',
    subheading:
      'PHIGuard gives your clinic an audit trail, a signed BAA, and a task system built for covered entities, not a generic tool bent to fit.',
    proof: [
      {
        title: 'BAA included',
        body: 'Legal baseline on every plan.',
      },
      {
        title: 'Audit history',
        body: 'Compliance actions stay reviewable later.',
      },
      {
        title: 'No card upfront',
        body: 'Try it before you set up billing.',
      },
    ],
  },
  hero: {
    headline: 'Per-clinic pricing. BAA at every tier.',
    subheadline:
      'PHIGuard gives practice administrators a calmer way to run compliance work. One clinic price, an immutable audit trail, and guardrails that generic task tools do not give you.',
    proof: [
      'BAA included on every plan',
      'Immutable audit trail by default',
      'Flat per-clinic pricing',
    ],
  },
  pricingTable: {
    kicker: 'Pricing',
    heading: 'Per-clinic pricing. No per-user fees.',
    body: 'Every plan includes a signed Business Associate Agreement and an immutable audit trail. No enterprise contracts. No surprise scaling costs.',
    annualBadge: '2 months free',
    baaBadge: 'BAA included',
    annualFinePrint: 'All prices in USD. Billed annually. Switch plans or cancel before renewal.',
    monthlyFinePrint: 'All prices in USD. Billed monthly. Cancel anytime. We email you 3 days before billing starts.',
  },
  pricingPage: {
    heroHeading: 'Which plan fits your clinic?',
    heroSummary:
      'This is not about who gets the HIPAA basics. Every plan includes the same legal and audit baseline. The plans differ in how much structure your team needs around it.',
    assuranceHeading: 'What never changes',
    assurances: [
      { title: 'BAA included', meta: 'Every plan' },
      { title: 'Append-only audit trail', meta: 'Every plan' },
      { title: 'Flat clinic pricing', meta: 'No per-seat drift' },
      { title: 'Self-serve trial', meta: 'Primary path' },
    ],
    planHeaderHeading: `${planNamesSentence} match how much your clinic has to manage.`,
    planHeaderBody:
      'Start with the plan that matches your people, handoffs, and locations. Ask about a custom path if your compliance work needs more help.',
    comparisonHeading: 'A quicker way to pick your plan.',
    faqHeading: 'Pricing questions',
    faqs: [
      {
        question: 'What should a small clinic choose first?',
        answer: `Most small clinics choose ${essentialsPlanName} when they need the HIPAA baseline and not the extra structure of the higher plans.`,
      },
      {
        question: `When does ${clinicPlanName} make more sense?`,
        answer: `${clinicPlanName} fits better once your practice has more coordination, more users, or a need for calendar and integration support.`,
      },
      {
        question: `What pushes an organization to ${groupPlanName}?`,
        answer: `${groupPlanName} is for multi-location reporting and advanced compliance work, such as policy, training, vendor, risk, and SOC 2 evidence management.`,
      },
      {
        question: 'Do you offer a custom path?',
        answer: 'Yes. Compliance Ops is a custom path for teams that need hands-on compliance support. It is not a public price card.',
      },
      {
        question: 'Can we just start a trial instead of talking to sales?',
        answer: 'Yes. Self-serve trial signup is the main action, and you do not need a credit card to start.',
      },
    ],
    schemaFaqs: [
      { q: 'Is there a free trial?', a: `Yes. Every plan includes a ${TRIAL_DAYS}-day free trial, and no credit card is required to start.` },
      { q: 'Is a BAA included on every plan?', a: `Yes. A signed Business Associate Agreement is included on ${planNamesSentence}.` },
      { q: 'How do I choose the right plan?', a: `Choose based on clinic complexity: ${essentialsPlanName} for the HIPAA baseline, ${clinicPlanName} for growing operational needs, and ${groupPlanName} for multi-location operations. Ask about a custom Compliance Ops path if you need hands-on support.` },
      { q: 'Do the pricing buttons preserve the selected plan?', a: 'Yes. Each plan-specific trial button sends the matching plan query parameter to signup.' },
    ],
  },
} as const
