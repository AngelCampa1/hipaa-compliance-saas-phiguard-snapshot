import { describe, expect, it } from 'vitest'
import {
  LEAD_CAPTURE_CTA_CONTEXTS,
  LEAD_MAGNETS_BY_SLUG,
  getPopupPickerSlugs,
  isPopupExcludedPath,
  shouldSuppressPopup,
} from './index.js'

describe('lead magnet config', () => {
  it('keeps CTA contexts explicit and queryable', () => {
    expect(LEAD_CAPTURE_CTA_CONTEXTS).toEqual([
      'popup-exit-intent',
      'popup-scroll-mobile',
      'popup-second-page',
      'inline-content-upgrade',
      'resource-sidebar',
      'newsletter-footer',
      'thank-you-download',
    ])
  })
})

describe('popup picker ranking', () => {
  it('returns the planned risk-analysis picker order', () => {
    expect(getPopupPickerSlugs('/learn/risk-analysis/how-to-do-a-hipaa-risk-analysis')).toEqual([
      'hipaa-risk-analysis-template',
      'hipaa-compliance-self-assessment',
      'incident-response-plan',
    ])
  })

  it('returns the planned incident-response picker order', () => {
    expect(getPopupPickerSlugs('/learn/incident-response/what-counts-as-a-hipaa-breach')).toEqual([
      'incident-response-plan',
      'hipaa-breach-decision-tree',
      'hipaa-compliance-self-assessment',
    ])
  })

  it('returns the planned commercial picker order', () => {
    expect(getPopupPickerSlugs('/pricing')).toEqual([
      'vendor-baa-tracker',
      'hipaa-pm-tool-comparison-guide',
      'hipaa-software-comparison-scorecard',
    ])
  })

  it('returns the planned training picker order for /learn/workforce-training paths', () => {
    expect(getPopupPickerSlugs('/learn/workforce-training/hipaa-training-requirements-for-employees')).toEqual([
      'hipaa-new-hire-checklist',
      'hipaa-annual-training-log',
      'hipaa-staff-training-quiz-template',
    ])
  })

  it('returns training cluster for /learn/training paths', () => {
    const slugs = getPopupPickerSlugs('/learn/training/overview')
    expect(slugs).toHaveLength(3)
    slugs.forEach((slug) => expect(slug in LEAD_MAGNETS_BY_SLUG).toBe(true))
  })

  it('returns vendor-management cluster for /learn/vendor-management', () => {
    const slugs = getPopupPickerSlugs('/learn/vendor-management')
    expect(slugs).toEqual([
      'vendor-baa-tracker',
      'hipaa-vendor-security-questionnaire',
      'baa-template',
    ])
    slugs.forEach((slug) => expect(slug in LEAD_MAGNETS_BY_SLUG).toBe(true))
  })

  it('returns vendor-management cluster for /resources/guides (is-X-hipaa-compliant pages)', () => {
    const slugs = getPopupPickerSlugs('/resources/guides/is-slack-hipaa-compliant')
    expect(slugs).toEqual([
      'vendor-baa-tracker',
      'hipaa-vendor-security-questionnaire',
      'baa-template',
    ])
    slugs.forEach((slug) => expect(slug in LEAD_MAGNETS_BY_SLUG).toBe(true))
  })

  it('returns compliance-operations cluster for /learn/compliance-operations', () => {
    const slugs = getPopupPickerSlugs('/learn/compliance-operations')
    expect(slugs).toEqual([
      'hipaa-annual-compliance-program-audit',
      'policy-review-calendar',
      'hipaa-evidence-binder-checklist',
    ])
    slugs.forEach((slug) => expect(slug in LEAD_MAGNETS_BY_SLUG).toBe(true))
  })

  it('returns locations cluster for /locations/hipaa-compliance/texas', () => {
    const slugs = getPopupPickerSlugs('/locations/hipaa-compliance/texas')
    expect(slugs).toEqual([
      'hipaa-state-law-compliance-checklist',
      'hipaa-state-law-overlay-matrix',
      'hipaa-compliance-self-assessment',
    ])
    slugs.forEach((slug) => expect(slug in LEAD_MAGNETS_BY_SLUG).toBe(true))
  })

  it('returns practice-types cluster for /practice-types/dental', () => {
    const slugs = getPopupPickerSlugs('/practice-types/dental')
    expect(slugs).toEqual([
      'hipaa-compliance-self-assessment',
      'telehealth-compliance-workflow-checklist',
      'hipaa-risk-analysis-template',
    ])
    slugs.forEach((slug) => expect(slug in LEAD_MAGNETS_BY_SLUG).toBe(true))
  })
})

describe('popup exclusions and suppression', () => {
  it('excludes legal, thank-you, error, and resource detail routes from popup rendering', () => {
    expect(isPopupExcludedPath('/privacy')).toBe(true)
    expect(isPopupExcludedPath('/privacy/')).toBe(true)
    expect(isPopupExcludedPath('/resources/thank-you')).toBe(true)
    expect(isPopupExcludedPath('/resources/baa-template')).toBe(true)
    expect(isPopupExcludedPath('/404')).toBe(true)
    expect(isPopupExcludedPath('/unsubscribe')).toBe(true)
    expect(isPopupExcludedPath('/notice-of-privacy-practices')).toBe(true)
    expect(isPopupExcludedPath('/learn/risk-analysis/how-to-do-a-hipaa-risk-analysis')).toBe(false)
    expect(isPopupExcludedPath('/compare/hipaa-compliance-software-comparison')).toBe(false)
    expect(isPopupExcludedPath('/pricing')).toBe(false)
  })

  it('suppresses once shown in-session or while dismiss/submit windows are active', () => {
    const now = Date.UTC(2026, 3, 22, 12, 0, 0)

    expect(shouldSuppressPopup({ now, sessionShown: true })).toBe(true)
    expect(shouldSuppressPopup({ now, dismissedUntil: now + 1 })).toBe(true)
    expect(shouldSuppressPopup({ now, submittedUntil: now + 1 })).toBe(true)
    expect(shouldSuppressPopup({ now, dismissedUntil: now - 1, submittedUntil: now - 1 })).toBe(false)
  })
})
