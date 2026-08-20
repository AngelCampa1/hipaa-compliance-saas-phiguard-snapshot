import { describe, expect, it } from 'vitest'
import { is, Table } from 'drizzle-orm'
import * as schema from './schema.js'

describe('marketing D1 schema', () => {
  it('exports only local lead and subscription tables', () => {
    expect(is(schema.marketingLeads, Table)).toBe(true)
    expect(is(schema.emailSubscriptions, Table)).toBe(true)
  })

  it('keeps expected marketing lead attribution columns', () => {
    const columns = Object.keys(schema.marketingLeads)
    expect(columns).toEqual(
      expect.arrayContaining([
        'id',
        'email',
        'magnetSlug',
        'createdAt',
        'utmSource',
        'utmMedium',
        'utmCampaign',
        'utmContent',
        'referrer',
        'sourcePagePath',
        'ctaContext',
        'consentMarketingAt',
      ]),
    )
  })

})
