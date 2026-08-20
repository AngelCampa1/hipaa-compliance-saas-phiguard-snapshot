import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  allKnowledgeItems,
  generateAiKnowledge,
  generateKnowledgeBundle,
  getKnowledgeItem,
  knowledgeDomains,
  validateKnowledgeItems,
} from './index'
import { HELP_CATEGORIES, HELP_TOPICS, ROUTE_HELP, getRouteHelp, searchHelpTopics } from './app'
import { marketingPlans, planNamesSentence, sitePrimaryCta } from './marketing'
import { SUPPORT_EMAIL, SUPPORT_PHI_WARNING } from './support'

const packageRoot = join(import.meta.dirname, '..')

describe('knowledge package contracts', () => {
  it('keeps every item valid for AI and consumer filtering', () => {
    expect(validateKnowledgeItems(allKnowledgeItems)).toEqual([])
    expect(knowledgeDomains).toEqual(['marketing', 'app', 'commercial', 'support', 'legalTrust'])

    for (const item of allKnowledgeItems) {
      expect(item.allowedConsumers.length).toBeGreaterThan(0)
      expect(item.safetyLabels).toContain('public-safe')
      expect(item.freshness.reviewCadence).toMatch(
        /^(monthly|quarterly|semiannual|annual|event-driven)$/,
      )
      expect(getKnowledgeItem(item.id)).toBe(item)
    }
  })

  it('generates deterministic app, marketing, and aggregate AI JSON', () => {
    const marketing = generateAiKnowledge('marketing')
    const app = generateAiKnowledge('app')
    const all = generateAiKnowledge('all')

    expect(marketing.domain).toBe('marketing')
    expect(
      marketing.items.every(
        (item) =>
          item.domain === 'marketing' ||
          item.domain === 'commercial' ||
          item.domain === 'support' ||
          item.domain === 'legalTrust',
      ),
    ).toBe(true)
    expect(
      marketing.items.every(
        (item) =>
          item.consumers.includes('marketing-assistant') || item.consumers.includes('marketing'),
      ),
    ).toBe(true)
    expect(
      marketing.items.every((item) => !('allowedConsumers' in item) && !('module' in item.source)),
    ).toBe(true)
    expect(app.domain).toBe('app')
    expect(
      app.items.every(
        (item) =>
          item.consumers.includes('authenticated-support') ||
          item.consumers.includes('authenticated-help'),
      ),
    ).toBe(true)
    expect(all.items.length).toBe(allKnowledgeItems.length)
    expect(all.generatedAt).toBe('static')
  })

  it('keeps generated AI JSON synced to TypeScript source', () => {
    for (const name of [
      'marketing',
      'app',
      'public',
      'emails',
      'marketing-infra',
      'all',
    ] as const) {
      const generatedPath = join(packageRoot, 'dist', 'ai', `${name}.json`)
      expect(existsSync(generatedPath)).toBe(true)
      expect(JSON.parse(readFileSync(generatedPath, 'utf8'))).toEqual(generateKnowledgeBundle(name))
      const generated = generateKnowledgeBundle(name)
      const itemDomains = new Set(generated.items.map((item) => item.domain))
      if (generated.domain !== 'all' && generated.domain !== 'mixed') {
        expect(itemDomains).toEqual(new Set([generated.domain]))
      }
    }
  })

  it('keeps generated knowledge bodies free of standalone sentence fragments', () => {
    const fragmentEndings = /\b(?:and|before|because|for|if|of|or|requested|the|to|with)$/i
    const offenders = generateAiKnowledge('all').items.flatMap((item) =>
      item.body
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .filter((line) => fragmentEndings.test(line))
        .map((line) => `${item.id}: ${line}`),
    )

    expect(offenders).toEqual([])
  })

  it('keeps app help data attached to valid topics', () => {
    const categoryIds = new Set(HELP_CATEGORIES.map((category) => category.id))
    const topicIds = new Set(HELP_TOPICS.map((topic) => topic.id))

    for (const topic of HELP_TOPICS) {
      expect(categoryIds.has(topic.category)).toBe(true)
      expect(topic.steps.length).toBeGreaterThan(1)
    }

    for (const routeHelp of Object.values(ROUTE_HELP)) {
      expect(routeHelp.relatedTopicIds.every((topicId) => topicIds.has(topicId))).toBe(true)
    }

    expect(searchHelpTopics('least privilege').map((topic) => topic.id)).toContain('invite-members')
    expect(getRouteHelp('/app/tasks/task_123')?.title).toBe('Task details')
  })

  it('derives commercial marketing plan display from billing and centralizes support copy', () => {
    expect(sitePrimaryCta).toMatchObject({
      label: 'Start free trial',
      href: 'https://my.phiguard.app/signup',
    })
    expect(marketingPlans.find((plan) => plan.id === 'essentials')).toMatchObject({
      name: 'Essentials',
      priceAnnualMonthly: '$30',
      priceAnnualList: '$1788',
    })
    expect(marketingPlans.map((plan) => plan.id)).toEqual([
      'essentials',
      'clinic',
      'group',
    ])
    expect(marketingPlans.find((plan) => plan.id === 'clinic')).toMatchObject({
      name: 'Clinic',
      priceAnnualMonthlyList: '$189',
      priceMonthlyList: '$229',
    })
    expect(SUPPORT_EMAIL).toBe('angel.campa@phiguard.app')
    expect(SUPPORT_PHI_WARNING).toContain('Please do not email patient names')
  })

  it('ensures every marketingPlan has the offering fields for single-source rendering', () => {
    for (const plan of marketingPlans) {
      expect(typeof plan.audienceShort).toBe('string')
      expect(plan.audienceShort.length).toBeGreaterThan(0)
      expect(typeof plan.comparisonIncludedBaseline).toBe('string')
      expect(plan.comparisonIncludedBaseline.length).toBeGreaterThan(0)
      expect(typeof plan.comparisonOperationalStepUp).toBe('string')
      expect(plan.comparisonOperationalStepUp.length).toBeGreaterThan(0)
      expect(typeof plan.commissionPercent).toBe('number')
      expect(plan.commissionPercent).toBeGreaterThanOrEqual(0)
      expect(plan.commissionPercent).toBeLessThanOrEqual(100)
    }
    expect(planNamesSentence).toBe('Essentials, Clinic, and Group')
  })
})
