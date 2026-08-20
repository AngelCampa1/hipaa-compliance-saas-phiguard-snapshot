import { describe, expect, it } from 'vitest'
import { classifyBreadcrumbItems } from './breadcrumbs'

describe('classifyBreadcrumbItems', () => {
  it('marks the last item as current and not a link', () => {
    const result = classifyBreadcrumbItems([
      { label: 'Reports', to: '/app/reports' },
      { label: 'Compliance progress', to: '/app/reports/compliance' },
    ])
    expect(result).toHaveLength(2)
    expect(result[0]).toEqual({
      item: { label: 'Reports', to: '/app/reports' },
      isCurrent: false,
      isLink: true,
    })
    expect(result[1].isCurrent).toBe(true)
    expect(result[1].isLink).toBe(false)
  })

  it('treats the last item as current even if `to` is provided', () => {
    const result = classifyBreadcrumbItems([
      { label: 'Reports', to: '/app/reports' },
      { label: 'Compliance', to: '/app/reports/compliance' },
    ])
    expect(result[1].isLink).toBe(false)
    expect(result[1].isCurrent).toBe(true)
  })

  it('treats non-last items without `to` as plain text, not links', () => {
    const result = classifyBreadcrumbItems([
      { label: 'Section' },
      { label: 'Page' },
    ])
    expect(result[0].isLink).toBe(false)
    expect(result[0].isCurrent).toBe(false)
    expect(result[1].isLink).toBe(false)
    expect(result[1].isCurrent).toBe(true)
  })

  it('handles a single-item trail by marking it current', () => {
    const result = classifyBreadcrumbItems([{ label: 'Home', to: '/' }])
    expect(result).toHaveLength(1)
    expect(result[0].isCurrent).toBe(true)
    expect(result[0].isLink).toBe(false)
  })

  it('returns an empty array for an empty input', () => {
    expect(classifyBreadcrumbItems([])).toEqual([])
  })

  it('rejects empty-string `to` as a non-link', () => {
    const result = classifyBreadcrumbItems([
      { label: 'A', to: '' },
      { label: 'B', to: '/b' },
    ])
    expect(result[0].isLink).toBe(false)
  })
})
