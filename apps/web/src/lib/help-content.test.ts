import { describe, expect, it } from 'vitest'
import {
  HELP_CATEGORIES,
  HELP_TOPICS,
  ROUTE_HELP,
  getHelpTopic,
  getHelpTopicsByCategory,
  getRouteHelp,
  searchHelpTopics,
} from './help-content'

describe('help content', () => {
  it('keeps every topic attached to a known category', () => {
    const categoryIds = new Set(HELP_CATEGORIES.map((category) => category.id))

    for (const topic of HELP_TOPICS) {
      expect(categoryIds.has(topic.category)).toBe(true)
      expect(topic.steps.length).toBeGreaterThan(1)
    }
  })

  it('finds the PDF download guide by natural search language', () => {
    const results = searchHelpTopics('open pdf')

    expect(results.map((topic) => topic.id)).toContain('open-pdf-download')
  })

  it('returns topics by category without mixing sections', () => {
    const topics = getHelpTopicsByCategory('tasks')

    expect(topics.length).toBeGreaterThan(0)
    expect(topics.every((topic) => topic.category === 'tasks')).toBe(true)
  })

  it('returns a topic by id', () => {
    expect(getHelpTopic('first-day')?.title).toBe('Your first day in PHIGuard')
  })

  it('keeps route help attached to valid help topics', () => {
    const topicIds = new Set(HELP_TOPICS.map((topic) => topic.id))

    for (const routeHelp of Object.values(ROUTE_HELP)) {
      expect(routeHelp.title).not.toHaveLength(0)
      expect(routeHelp.summary).not.toHaveLength(0)
      expect(routeHelp.primaryAction).not.toHaveLength(0)
      expect(routeHelp.relatedTopicIds.length).toBeGreaterThan(0)
      expect(routeHelp.relatedTopicIds.every((topicId) => topicIds.has(topicId))).toBe(true)
    }
  })

  it('returns the closest route help for nested app routes', () => {
    expect(getRouteHelp('/app/tasks/abc123')?.title).toBe('Task details')
    expect(getRouteHelp('/app/compliance/checklists/abc123')?.title).toBe('Checklist details')
    expect(getRouteHelp('/app/compliance/program/vendors')?.title).toBe('Vendors')
    expect(getRouteHelp('/app/reports/tasks')?.title).toBe('Reports')
    expect(getRouteHelp('/app/soc2/access-reviews/review_123')?.title).toBe('SOC 2')
  })

  it('searches route help definitions and tooltip text', () => {
    const results = searchHelpTopics('least privilege')

    expect(results.map((topic) => topic.id)).toContain('invite-members')
  })
})
