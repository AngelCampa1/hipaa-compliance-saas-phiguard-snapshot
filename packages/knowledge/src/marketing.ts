import {
  COMMERCIAL_COPY,
  DEFAULT_BILLING_CADENCE,
  LIMITED_OFFER_PROMOTIONS,
  PLANS,
  PUBLIC_PLAN_IDS,
  getMinimumPlanForFeatures,
  getPlanPromotionPriceDisplay,
  getPromotionDisplayCopy,
  type BillingCadence,
  type FeatureKey,
  type StoredPlanId,
} from '@phiguard/billing/plans'
import { PHIGUARD_SIGNUP_URL } from '@phiguard/brand/identity'

export const sitePrimaryCta = {
  label: 'Start free trial',
  href: PHIGUARD_SIGNUP_URL,
}

export const siteSecondaryCtas = {
  pricing: { label: 'See pricing', href: '/pricing' },
  security: { label: 'Review security', href: '/security' },
  baa: { label: 'Review the BAA', href: '/baa' },
  product: { label: 'See how it works', href: '/product' },
}

const programOperationsMinimumPlanName = PLANS[getMinimumPlanForFeatures(['multi_location_rollup'])].name

export const trustClaims = [
  {
    title: 'BAA at every plan',
    body: 'You get a signed BAA from your first login. You do not have to ask for an enterprise plan to get it.',
  },
  {
    title: 'Append-only audit history',
    body: 'Task actions, evidence, incident updates, and program work build a lasting record you can review later.',
  },
  {
    title: 'Per-clinic pricing',
    body: 'You pay one price for the clinic. We do not charge per user for each admin, provider, and coordinator.',
  },
  {
    title: 'Plain security claims',
    body: 'Our security pages tell you what the product does today. We do not claim certifications we have not earned.',
  },
] as const

export const productPillars = [
  {
    id: 'tasks-audit',
    slug: 'hipaa-task-management-audit-history',
    name: 'Recurring HIPAA tasks and audit history',
    shortName: 'Task management and audit history',
    seoTitle: 'HIPAA Task Management and Audit History | PHIGuard',
    metaDescription:
      'See how PHIGuard keeps recurring HIPAA tasks, owners, evidence, and audit history together for small clinic operations.',
    summary: 'Assign recurring clinic work, keep its full history, and tie each task to the person who owns it.',
    detail: 'Built for clinics where ownership, timing, and audit history matter.',
    problem:
      'Small clinics often track HIPAA work across spreadsheets, email, calendars, and basic task boards. Later it is hard to say who owned the work, when it changed, and what record backs the decision.',
    problemHeading: 'HIPAA task management breaks when ownership and evidence live in separate tools.',
    solution:
      'PHIGuard gives each HIPAA task an owner, a status, a due date, an evidence area, and audit history. The work is easier to run now and easier to review later.',
    solutionHeading: 'PHIGuard keeps HIPAA tasks, evidence, and audit history in one place.',
    outcome:
      'Your clinic gets a clear record of recurring HIPAA work. You do not have to rebuild a compliance process inside a generic project tool.',
    outcomeHeading: 'HIPAA task management creates a record you can review.',
    workflowSteps: [
      {
        title: 'Assign the recurring HIPAA task',
        body: 'Set an owner, a due date, and a status. Add enough detail that the next person knows what to do.',
      },
      {
        title: 'Attach the proof to the work',
        body: 'Keep notes, files, and completion details on the task. The evidence stays out of email and shared folders.',
      },
      {
        title: 'Review the history later',
        body: 'Use the task record and audit events to see what changed, who acted, and when.',
      },
    ],
    bullets: [
      'Recurring and one-off tasks for clinic work',
      'Append-only audit events tied to user actions',
      'Task attachments and evidence',
      'HIPAA records instead of a generic project tool',
    ],
    evaluationPoints: [
      {
        label: 'Best fit',
        body: 'Clinic administrators who need HIPAA tasks to show the owner, timing, evidence, and history, with no per-user fees.',
      },
      {
        label: 'Replaces',
        body: 'Spreadsheet trackers, calendar reminders, and task comments that are hard to review after staff leave.',
      },
      {
        label: 'Proof to check',
        body: 'Look for task history, owner changes, and evidence. Check whether recurring work can be reviewed without piecing it back together by hand.',
      },
    ],
    aiAnswer:
      'PHIGuard helps clinics manage HIPAA tasks by keeping assignments, dates, evidence, and append-only audit history in one place. It is built for clinic teams that need a reviewable record of recurring compliance work.',
    faq: [
      {
        q: 'What makes HIPAA task management different from a normal task list?',
        a: 'HIPAA task management needs a record you can stand behind. Your clinic should be able to see the owner, timing, evidence, and history behind work that may be reviewed later.',
      },
      {
        q: 'Does PHIGuard replace every project management tool?',
        a: 'No. PHIGuard is for HIPAA work. Keep general projects elsewhere and use PHIGuard for tasks that need compliance context and audit history.',
      },
    ],
    relatedLinks: [
      { label: 'HIPAA basics', href: '/learn/hipaa-basics', description: 'Review the rules and key ideas behind HIPAA work.' },
      { label: 'Pricing', href: '/pricing', description: 'Compare plans for clinics that need the audit baseline.' },
      { label: 'Security', href: '/security', description: 'See how audit behavior fits the trust posture.' },
    ],
    audience: 'Every plan',
  },
  {
    id: 'checklists-evidence',
    slug: 'hipaa-checklists-evidence-exports',
    name: 'Checklists, evidence, and exports',
    shortName: 'Checklists and evidence',
    seoTitle: 'HIPAA Checklists, Evidence, and Exports | PHIGuard',
    metaDescription:
      'Learn how PHIGuard helps clinics turn HIPAA checklists into evidence-backed work with export-ready records.',
    summary: 'Start from HIPAA checklists and templates instead of rebuilding the program in shared docs or spreadsheets.',
    detail: 'Useful when a clinic needs repeatable work and clearer records for reviews.',
    problem:
      'A checklist turns into just another document when the evidence, notes, and follow-up live somewhere else. You may know a step was done but still struggle to show the record.',
    problemHeading: 'HIPAA checklists fail when the evidence lives somewhere else.',
    solution:
      'PHIGuard keeps checklist work, evidence, and exports next to the task record. You can prove what was done without digging through folders and inboxes.',
    solutionHeading: 'PHIGuard keeps checklist work and evidence together.',
    outcome:
      'You can go from a checklist item to its evidence fast. That cuts review friction and handoff risk.',
    outcomeHeading: 'HIPAA checklists become easier to review and export.',
    workflowSteps: [
      {
        title: 'Start from a HIPAA checklist',
        body: 'Use a checklist or template made for clinic compliance work instead of starting from a blank page.',
      },
      {
        title: 'Turn checklist items into real work',
        body: 'Assign owners and dates so the checklist becomes live work, not a file no one touches.',
      },
      {
        title: 'Export a cleaner review record',
        body: 'Keep evidence close to each checklist item. Internal reviews and outside requests get easier to answer.',
      },
    ],
    bullets: [
      'HIPAA starter checklists and templates',
      'Evidence capture on compliance work items',
      'Records that are easier to hand to reviewers',
      'Export-ready records for audits and program reviews',
    ],
    evaluationPoints: [
      {
        label: 'Best fit',
        body: 'Clinics that know what to complete but struggle to prove it without searching across separate folders.',
      },
      {
        label: 'Replaces',
        body: 'Static checklist documents, loose screenshots, and file folders that do not show how the work was done.',
      },
      {
        label: 'Proof to check',
        body: 'Look for evidence fields, export paths, and reviewer-friendly records. Check whether checklist work stays linked to its task.',
      },
    ],
    aiAnswer:
      'PHIGuard supports HIPAA checklists by tying checklist work to evidence and export-ready records. Clinics can use templates while keeping proof near the work that produced it.',
    faq: [
      {
        q: 'Why should HIPAA evidence stay near the checklist item?',
        a: 'Evidence is more useful when it sits with the work it supports. Reviewers and clinic leaders can see what happened without piecing it together from separate files.',
      },
      {
        q: 'Are exports useful for internal reviews?',
        a: 'Yes. Exports help you share a cleaner record during audits, management reviews, vendor reviews, or program checkups.',
      },
    ],
    relatedLinks: [
      { label: 'HIPAA self-assessment', href: '/resources/hipaa-compliance-self-assessment', description: 'Use a worksheet to spot gaps in evidence and follow-up.' },
      { label: 'Resources', href: '/resources', description: 'Find templates and guides for clinic compliance work.' },
      { label: 'Product overview', href: '/product', description: 'Return to the full feature map.' },
    ],
    audience: 'Every plan',
  },
  {
    id: 'program-operations',
    slug: 'hipaa-policies-training-risk-vendor-baas',
    name: 'Policies, training, risk, and vendor BAAs',
    shortName: 'Policies, training, risk, and vendors',
    seoTitle: 'HIPAA Policies, Training, Risk, and Vendor BAAs | PHIGuard',
    metaDescription:
      `See how PHIGuard ${programOperationsMinimumPlanName}-plan operations help clinics organize policies, training records, risk work, and vendor BAA tracking.`,
    summary: `Add advanced ${programOperationsMinimumPlanName}-plan program modules for policies, training records, risk work, and vendor BAA tracking.`,
    detail: `For ${programOperationsMinimumPlanName}-plan teams that need policies, training, risk work, and vendor BAA tracking inside the app.`,
    problem:
      'As clinics grow, HIPAA work spreads into policies, staff training, risk reviews, and vendor records. Those records often sit in different systems, which makes them harder to own and review.',
    problemHeading: 'HIPAA program work breaks down when each record has a different home.',
    solution:
      `PHIGuard adds ${programOperationsMinimumPlanName}-plan modules for policy sign-offs, training completion, risk records, and vendor BAA status. Program work stays connected to the rest of your clinic.`,
    solutionHeading: 'PHIGuard connects policies, training, risk, and vendor BAA work.',
    outcome:
      'Larger clinics get one clear HIPAA program record. You do not have to push every compliance process into a general document library.',
    outcomeHeading: 'Program work becomes easier to assign, track, and review.',
    workflowSteps: [
      {
        title: 'Organize the program record',
        body: 'Keep policies, training, risk work, and vendor BAA status in one structure built for HIPAA work.',
      },
      {
        title: 'Assign follow-up',
        body: 'Turn program gaps into owned tasks so a policy review, training cycle, risk item, or vendor update does not sit idle.',
      },
      {
        title: 'Review program status',
        body: 'Give leaders a clear view of what is current, what needs attention, and which records back the answer.',
      },
    ],
    bullets: [
      'Policy publishing and acknowledgement tracking',
      'Workforce training assignment and completion tracking',
      'Risk assessment records and scoring summaries',
      'Vendor inventory with BAA status tracking',
    ],
    evaluationPoints: [
      {
        label: 'Best fit',
        body: `${programOperationsMinimumPlanName}-plan clinics with enough staff, vendors, and governance work that policy and training records need their own operating layer.`,
      },
      {
        label: 'Replaces',
        body: 'Policy folders, training spreadsheets, vendor BAA lists, and risk worksheets that are not tied to follow-up tasks.',
      },
      {
        label: 'Proof to check',
        body: 'Look for sign-off history, training completion, vendor status, and risk records. Check that overdue program work has a clear owner.',
      },
    ],
    aiAnswer:
      `PHIGuard helps ${programOperationsMinimumPlanName}-plan clinics organize HIPAA program work, including policies, training records, risk work, and vendor BAA tracking. It ties those records to real follow-up.`,
    faq: [
      {
        q: 'Which clinics need the advanced program modules?',
        a: 'They fit clinics with more locations, more handoffs, or more formal governance needs. Smaller teams may only need the shared task, evidence, incident, and audit baseline.',
      },
      {
        q: 'Why track vendor BAAs inside the compliance work?',
        a: 'Vendor BAA status decides whether a tool can be used for PHI. Keeping that status near tasks and reviews makes vendor changes easier to catch.',
      },
    ],
    relatedLinks: [
      { label: 'Vendor management', href: '/learn/vendor-management', description: 'Learn how BAAs and vendor records fit clinic work.' },
      { label: 'Workforce training', href: '/learn/workforce-training', description: 'Review training and onboarding operating practices.' },
      { label: 'Group pricing', href: '/pricing', description: 'Compare the plan that includes advanced program operations.' },
    ],
    audience: 'Group plan advanced operations',
  },
  {
    id: 'incidents',
    slug: 'hipaa-incident-response-history',
    name: 'Incidents and response history',
    shortName: 'Incident response history',
    seoTitle: 'HIPAA Incident Response History | PHIGuard',
    metaDescription:
      'Learn how PHIGuard helps clinics document suspected incidents, response steps, status, and retained incident history.',
    summary: 'Write down events, keep response steps visible, and save incident history in the same system as the rest of the program.',
    detail: 'Keeps incident response in the same trusted system as the rest of the HIPAA program.',
    problem:
      'The first notes after a suspected incident often land in email, chat, or a manager notebook. That leaves a weak record when you later need to explain what happened and what you did next.',
    problemHeading: 'HIPAA incident response gets weaker when the first notes are scattered.',
    solution:
      'PHIGuard gives you one place to file incidents, track status, record response details, and keep the history next to the rest of the HIPAA program.',
    solutionHeading: 'PHIGuard keeps incident response history in a clear record.',
    outcome:
      'You can respond with a clear record instead of rebuilding the incident timeline after the fact.',
    outcomeHeading: 'Incident response creates a timeline you can explain later.',
    workflowSteps: [
      {
        title: 'Open a clear incident record',
        body: 'Record the suspected event, category, severity, affected systems, and first response notes in one place.',
      },
      {
        title: 'Track response work',
        body: 'Keep follow-up tasks, status changes, and response details on the incident record as you investigate.',
      },
      {
        title: 'Save the incident history',
        body: 'Keep the timeline and related work so you can explain what happened without leaning on memory or an email search.',
      },
    ],
    bullets: [
      'Clear incident reporting',
      'Severity, category, and affected-system tracking',
      'Tracking from first report through closure',
      'Recordkeeping that keeps incident history',
    ],
    evaluationPoints: [
      {
        label: 'Best fit',
        body: 'Clinics that want a calmer way to record suspected privacy or security incidents before they know the final answer.',
      },
      {
        label: 'Replaces',
        body: 'Loose manager notes, chat threads, email chains, and separate follow-up lists made during stressful events.',
      },
      {
        label: 'Proof to check',
        body: 'Look for incident status, response notes, history, linked follow-up work, and evidence kept with the record.',
      },
    ],
    aiAnswer:
      'PHIGuard supports HIPAA incident response by giving clinics one incident record with status, severity, response details, and saved history. It keeps incident work connected to the rest of the compliance program.',
    faq: [
      {
        q: 'Does PHIGuard decide whether an incident is a reportable breach?',
        a: 'No. PHIGuard helps you keep the record. Your clinic still needs its own legal, privacy, and compliance review for breach decisions.',
      },
      {
        q: 'Why keep incidents in the same system as HIPAA tasks?',
        a: 'Incident response often creates follow-up tasks, evidence, and reviews. Keeping the records together makes the timeline easier to follow.',
      },
    ],
    relatedLinks: [
      { label: 'Incident response guide', href: '/learn/incident-response', description: 'Read practical help for suspected HIPAA incidents.' },
      { label: 'Breach notification by state', href: '/locations/hipaa-breach-notification', description: 'Review state-focused notification pages.' },
      { label: 'Security posture', href: '/security', description: 'Connect incident records to the public trust posture.' },
    ],
    audience: 'Every plan',
  },
  {
    id: 'group-operations',
    slug: 'multi-location-hipaa-reporting-group-controls',
    name: 'Multi-location reporting and Group controls',
    shortName: 'Multi-location reporting',
    seoTitle: 'Multi-Location HIPAA Reporting and Group Controls | PHIGuard',
    metaDescription:
      'See how PHIGuard supports larger clinics with cross-location reporting, integrations, access reviews, and stronger evidence handling.',
    summary: 'Support larger clinics and multi-site groups that need shared visibility, integrations, and stronger evidence handling.',
    detail: 'Supports larger groups that need shared visibility and stronger evidence handling.',
    problem:
      'Multi-location clinics need one view without asking each site to keep its own separate record. If evidence, access reviews, and reports stay local, leaders see only part of the picture.',
    problemHeading: 'Multi-location HIPAA reporting breaks when every site keeps a separate record.',
    solution:
      'PHIGuard gives Group organizations shared visibility, cross-location reporting, integration settings, access review tracking, and stronger evidence handling.',
    solutionHeading: 'PHIGuard connects local ownership with Group-level visibility.',
    outcome:
      'Leaders can review HIPAA work across locations while each clinic keeps daily work tied to clear records.',
    outcomeHeading: 'Multi-location controls give leaders a clearer Group view.',
    workflowSteps: [
      {
        title: 'Keep local work owned',
        body: 'Each clinic keeps owners, evidence, and task history on the work it actually does.',
      },
      {
        title: 'Roll status up for leaders',
        body: 'Group-level reporting helps leaders see patterns across locations without asking each site to rebuild the record.',
      },
      {
        title: 'Add stronger controls',
        body: 'Use integrations, access review tracking, and stronger evidence handling when the group needs more governance.',
      },
    ],
    bullets: [
      'Calendar and integration settings for coordination across sites',
      'Cross-location rollup reporting for Group organizations',
      'SOC 2 evidence collection and bundle exports',
      'Access review tracking for added governance',
    ],
    evaluationPoints: [
      {
        label: 'Best fit',
        body: 'Multi-location clinics and larger groups that need shared visibility without giving up local ownership.',
      },
      {
        label: 'Replaces',
        body: 'Location-by-location spreadsheets, manual report requests, and evidence folders that do not roll up cleanly.',
      },
      {
        label: 'Proof to check',
        body: `Look for cross-location status, access review tracking, integration settings, evidence exports, and clear ${programOperationsMinimumPlanName}-plan boundaries.`,
      },
    ],
    aiAnswer:
      'PHIGuard supports larger and multi-location clinics with cross-location reporting, connected operations, access review tracking, and stronger evidence handling. These controls help leaders review HIPAA work across sites.',
    faq: [
      {
        q: 'What changes when a clinic has multiple locations?',
        a: 'Leaders need a rollup view while local teams still need clear owners and records. Multi-location reporting connects those views.',
      },
      {
        q: 'Are Group controls only for enterprise teams?',
        a: 'No. They are for clinics that have grown past a single-location setup, especially when reporting, access reviews, and governance get hard to manage by hand.',
      },
    ],
    relatedLinks: [
      { label: 'Practice types', href: '/practice-types', description: 'Browse clinic pages by specialty.' },
      { label: 'Pricing', href: '/pricing', description: 'Compare plans for multi-location needs.' },
      { label: 'Trust center', href: '/trust', description: 'Review the legal, security, and subprocessor links.' },
    ],
    audience: 'Clinic and Group, with advanced controls on Group',
  },
] as const

type MarketingPlan = {
  id: StoredPlanId
  name: string
  priceMonthly: string
  priceMonthlyList: string
  priceMonthlyAmount: number
  priceMonthlyListAmount: number
  priceAnnualMonthly: string
  priceAnnualMonthlyList: string
  priceAnnualMonthlyAmount: number
  priceAnnualMonthlyListAmount: number
  priceAnnual: string
  priceAnnualList: string
  priceAnnualAmount: number
  priceAnnualListAmount: number
  promoBadge: string
  defaultCadence: BillingCadence
  maxMembers: number
  summary: string
  fit: string
  audienceShort: string
  comparisonIncludedBaseline: string
  comparisonOperationalStepUp: string
  commissionPercent: number
  ctaHref: string
  capabilities: string[]
  advanced: string[]
  highlighted?: boolean
  pricesByOffer: Record<string, {
    priceMonthly: string
    priceMonthlyList: string
    priceMonthlyAmount: number
    priceAnnualMonthly: string
    priceAnnualMonthlyList: string
    priceAnnualMonthlyAmount: number
    priceAnnual: string
    priceAnnualList: string
    priceAnnualAmount: number
    promoBadge: string
  }>
}

function hasFeature(planId: StoredPlanId, feature: FeatureKey) {
  return PLANS[planId].features.includes(feature)
}

const publicPlanIds = PUBLIC_PLAN_IDS

const monthlyOffer = LIMITED_OFFER_PROMOTIONS.find((offer) => offer.billingCadence === 'monthly')
const yearlyOffer = LIMITED_OFFER_PROMOTIONS.find((offer) => offer.billingCadence === 'annual') ?? LIMITED_OFFER_PROMOTIONS[0]
if (!monthlyOffer || !yearlyOffer) {
  throw new Error('Expected public limited offer promotions for monthly and annual billing cadences')
}

const yearlyOfferCopy = getPromotionDisplayCopy(yearlyOffer)

export const limitedOfferCommercialCopy = {
  promoCode: yearlyOfferCopy?.code ?? yearlyOffer.id,
  monthlyPromoCode: monthlyOffer.id,
  yearlyPromoCode: yearlyOffer.id,
  promoPercentOff: yearlyOffer.percentOff,
  promoPercentOffLabel: yearlyOfferCopy?.percentOffLabel ?? `${yearlyOffer.percentOff}%`,
  promoAppliesTo: yearlyOfferCopy?.appliesToLabel ?? yearlyOffer.appliesTo,
  promoBadge: yearlyOfferCopy?.badgeLabel ?? `${yearlyOffer.percentOff}% off`,
  promoOfferLabel: yearlyOfferCopy?.offerLabel ?? 'Limited offer',
  promoAutoApply: yearlyOffer.autoApplyAtCheckout,
  promoAutoApplyLabel: yearlyOfferCopy?.autoApplyLabel ?? 'Auto-applied at checkout',
  promoBannerMessage: yearlyOfferCopy?.bannerMessage ?? `${yearlyOffer.id} is auto-applied at checkout.`,
  promoCheckoutNote: yearlyOfferCopy?.checkoutNote ?? `${yearlyOffer.id} is auto-applied.`,
  guarantee: COMMERCIAL_COPY.moneyBackGuarantee,
} as const

export const LIMITED_OFFER_COPY = LIMITED_OFFER_PROMOTIONS.map((offer) => {
  const copy = getPromotionDisplayCopy(offer)!
  return {
    id: offer.id,
    billingCadence: offer.billingCadence,
    redemptionCap: offer.redemptionCap,
    percentOff: offer.percentOff,
    code: copy.code,
    percentOffLabel: copy.percentOffLabel,
    badgeLabel: copy.badgeLabel,
    bannerMessage: copy.bannerMessage,
    checkoutNote: copy.checkoutNote,
    offerLabel: copy.offerLabel,
    autoApplyLabel: copy.autoApplyLabel,
    detailsLabel: 'Offer details',
  }
})

const allPlans = publicPlanIds.map((planId): MarketingPlan => {
  const plan = PLANS[planId]

  const sharedCapabilities = [
    'Recurring HIPAA task management',
    'Compliance starter checklists',
    'Immutable audit trail',
    'Incident tracking',
    'Business Associate Agreement included',
  ]

  const advancedCapabilities = [
    hasFeature(planId, 'integrations_basic') ? 'Calendar integrations and connected operations' : null,
    hasFeature(planId, 'multi_location_rollup') ? 'Multi-location reporting' : null,
    hasFeature(planId, 'compliance_addon') ? 'Policies, training, risk assessments, and vendor BAA tracking' : null,
    hasFeature(planId, 'soc2_evidence') ? 'SOC 2 evidence and access reviews' : null,
  ].filter((value): value is string => Boolean(value))

  const monthlyPrice = getPlanPromotionPriceDisplay(planId, 'monthly')
  const annualPrice = getPlanPromotionPriceDisplay(planId, 'annual')
  const basePlan = {
    id: planId,
    name: plan.name,
    priceMonthly: monthlyPrice.discountedEffectiveMonthlyLabel,
    priceMonthlyList: monthlyPrice.listEffectiveMonthlyLabel,
    priceMonthlyAmount: Math.ceil(monthlyPrice.discountedEffectiveMonthly),
    priceMonthlyListAmount: monthlyPrice.listEffectiveMonthly,
    priceAnnualMonthly: annualPrice.discountedEffectiveMonthlyLabel,
    priceAnnualMonthlyList: annualPrice.listEffectiveMonthlyLabel,
    priceAnnualMonthlyAmount: Math.ceil(annualPrice.discountedEffectiveMonthly),
    priceAnnualMonthlyListAmount: annualPrice.listEffectiveMonthly,
    priceAnnual: annualPrice.discountedTotalLabel,
    priceAnnualList: annualPrice.listTotalLabel,
    priceAnnualAmount: Math.ceil(annualPrice.discountedTotal),
    priceAnnualListAmount: annualPrice.listTotal,
    promoBadge: limitedOfferCommercialCopy.promoBadge,
    defaultCadence: DEFAULT_BILLING_CADENCE,
    maxMembers: plan.maxMembers,
    ctaHref: `${sitePrimaryCta.href}?plan=${planId}`,
    pricesByOffer: Object.fromEntries(
      LIMITED_OFFER_PROMOTIONS.map((offer) => {
        const mp = getPlanPromotionPriceDisplay(planId, 'monthly', offer.billingCadence === 'monthly' ? offer : null)
        const ap = getPlanPromotionPriceDisplay(planId, 'annual', offer.billingCadence === 'annual' ? offer : null)
        const entry = {
          priceMonthly: mp.discountedEffectiveMonthlyLabel,
          priceMonthlyList: mp.listEffectiveMonthlyLabel,
          priceMonthlyAmount: Math.ceil(mp.discountedEffectiveMonthly),
          priceAnnualMonthly: ap.discountedEffectiveMonthlyLabel,
          priceAnnualMonthlyList: ap.listEffectiveMonthlyLabel,
          priceAnnualMonthlyAmount: Math.ceil(ap.discountedEffectiveMonthly),
          priceAnnual: ap.discountedTotalLabel,
          priceAnnualList: ap.listTotalLabel,
          priceAnnualAmount: Math.ceil(ap.discountedTotal),
          promoBadge: getPromotionDisplayCopy(offer)?.badgeLabel ?? `${offer.percentOff}% off`,
        }
        return [offer.id, entry]
      })
    ) as MarketingPlan['pricesByOffer'],
  }

  if (planId === 'essentials') {
    return {
      ...basePlan,
      summary: 'Start with a HIPAA operations hub for a small clinic without per-seat overhead.',
      fit: 'Best for solo and small clinics that need a signed BAA, recurring HIPAA tasks, incidents, evidence, and an auditable operating record.',
      audienceShort: 'Small clinics needing the HIPAA baseline',
      comparisonIncludedBaseline: 'Tasks, audit trail, starter checklists, incidents, BAA',
      comparisonOperationalStepUp: 'Keep the program simple and auditable',
      commissionPercent: 20,
      capabilities: sharedCapabilities,
      advanced: ['Designed for smaller clinics that do not yet need integrations or multi-location rollups.'],
    }
  }

  if (planId === 'clinic') {
    return {
      ...basePlan,
      summary: 'Add structure for a growing practice that needs more connected HIPAA operations without jumping to Group controls.',
      fit: 'Best for clinics with multiple admins or providers, more handoffs, and the need to keep tasks, evidence, incidents, and calendars connected.',
      audienceShort: 'Growing clinics with more coordination and integrations',
      comparisonIncludedBaseline: 'Everything in Essentials plus integrations',
      comparisonOperationalStepUp: 'Add more connected operations support',
      commissionPercent: 20,
      capabilities: [...sharedCapabilities, 'Calendar integrations and connected operations'],
      advanced: ['Keeps the self-serve trial path while giving growing clinics more operational headroom.'],
      highlighted: true,
    }
  }

  if (planId === 'group') {
    return {
      ...basePlan,
      summary: 'Run a broader HIPAA operations hub across larger or multi-location organizations with advanced evidence and reporting controls.',
      fit: 'Best for group practices and multi-site organizations that need rollup reporting, policies, training, risk, vendor BAAs, and stronger governance controls.',
      audienceShort: 'Group practices and multi-location organizations',
      comparisonIncludedBaseline: 'Everything in Clinic plus rollups and advanced compliance operations',
      comparisonOperationalStepUp: 'Add cross-location reporting, program modules, and advanced evidence handling',
      commissionPercent: 20,
      capabilities: [...sharedCapabilities, ...advancedCapabilities],
      advanced: ['Advanced program modules and reporting are reserved for organizations with more locations, reviewers, or governance needs.'],
    }
  }

  throw new Error(`Unhandled planId in allPlans map: ${planId}`)
})

export const marketingPlans = allPlans

export const customPricingPath = {
  name: PLANS.compliance_ops.name,
  summary: 'Need a custom compliance setup? Ask us about Compliance Ops.',
  detail: 'There is no public price. We plan this path with you.',
  ctaLabel: 'Ask about Compliance Ops',
  ctaHref: `${sitePrimaryCta.href}?plan=group&path=compliance-ops`,
} as const

function buildPlanNamesSentence(plans: typeof allPlans): string {
  const names = plans.map((p) => p.name)
  if (names.length === 0) throw new Error('buildPlanNamesSentence requires at least one plan')
  if (names.length === 1) return names[0]!
  if (names.length === 2) return `${names[0]} and ${names[1]}`
  return `${names.slice(0, -1).join(', ')}, and ${names[names.length - 1]}`
}

export const planNamesSentence = buildPlanNamesSentence(marketingPlans)

export const comparisonRows = [
  {
    requirement: 'Business Associate Agreement',
    generic: 'Often not offered, or held for enterprise buyers',
    phiguard: 'Included at every plan',
  },
  {
    requirement: 'Audit-ready task history',
    generic: 'Activity feed or mutable history',
    phiguard: 'Append-only audit trail',
  },
  {
    requirement: 'Pricing model',
    generic: 'Per-user cost growth',
    phiguard: 'Flat clinic pricing',
  },
  {
    requirement: 'Recurring compliance work',
    generic: 'Generic project templates or none',
    phiguard: 'HIPAA-oriented tasks, checklists, and evidence',
  },
  {
    requirement: 'Incident response process',
    generic: 'Usually managed outside the tool',
    phiguard: 'Structured incident tracking in-product',
  },
] as const

export const comparisonWinnerPositioning = {
  headline: 'PHIGuard fits small clinics that need HIPAA work handled, not another generic workspace.',
  bestFor: 'small clinics that need HIPAA operations',
  summary:
    'PHIGuard is the better fit when your clinic needs a BAA at every plan, audit history, per-clinic pricing, and compliance tasks, incidents, vendors, and policies in one system.',
  variants: {
    hub: {
      eyebrow: 'Why PHIGuard fits',
      context:
        'The real question is simple: which product runs the clinic work, not just stores the documents? PHIGuard is built to run the work.',
    },
    comparison: {
      eyebrow: 'PHIGuard advantage',
      context:
        'PHIGuard is the better fit when your clinic cares more about HIPAA records, clear task ownership, and steady clinic pricing than about broad general-purpose features.',
    },
    alternative: {
      eyebrow: 'Why switch to PHIGuard',
      context:
        'Keep generic tools where they help. Move your compliance work into PHIGuard when a BAA, audit history, and clinic operations matter.',
    },
  },
  proofPoints: [
    {
      title: 'BAA every plan',
      body: 'You get a BAA on the standard plan. You do not have to ask for an enterprise plan to get it.',
    },
    {
      title: 'Audit history for clinic work',
      body: 'Tasks, incidents, evidence, and program actions keep a clearer record than loose boards or documents.',
    },
    {
      title: 'Per-clinic pricing',
      body: 'Plans are priced per clinic. Adding admins, providers, and coordinators does not raise the price.',
    },
    {
      title: 'HIPAA operations system',
      body: 'Compliance tasks, incidents, vendors, policies, training, risk, and evidence live in one system built for covered-entity work.',
    },
  ],
  caveat:
    'PHIGuard is not the best fit for every buyer. Enterprise teams with broad GRC needs, deep custom development, or non-clinic collaboration should compare those needs directly.',
} as const
