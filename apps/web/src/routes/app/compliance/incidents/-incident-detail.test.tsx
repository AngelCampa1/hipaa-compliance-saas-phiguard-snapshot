import { renderToString } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

vi.mock('@tanstack/react-router', () => ({
  createFileRoute: () => (config: unknown) => ({
    ...(typeof config === 'object' && config ? config : {}),
  }),
  Link: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
  useRouter: () => ({ invalidate: vi.fn() }),
}))

vi.mock('../../../../server/compliance.js', () => ({
  appendIncidentUpdateFn: vi.fn(),
  getComplianceScopeFn: vi.fn(),
  getIncidentFn: vi.fn(),
  listIncidentUpdatesFn: vi.fn(),
  transitionIncidentFn: vi.fn(),
  updateIncidentFn: vi.fn(),
}))

vi.mock('../../../../lib/product-analytics-browser', () => ({
  trackProductEvent: vi.fn(),
}))

vi.mock('../../../../components/compliance-error-boundary', () => ({
  AppRouteErrorBoundary: () => null,
}))

vi.mock('@phiguard/ui', () => ({
  // Mirror the real formatDate/formatDateTime: en-US, pinned to UTC, so the test
  // asserts the same hydration-safe output the product renders.
  formatDate: (value: string | number | Date, options?: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', ...options }).format(new Date(value)),
  formatDateTime: (value: string | number | Date, options?: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat('en-US', {
      timeZone: 'UTC',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      ...options,
    }).format(new Date(value)),
  Alert: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Badge: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
  Button: ({ children }: { children: React.ReactNode }) => <button>{children}</button>,
  Dialog: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogFooter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogTitle: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  InputPrimitive: () => <input />,
  Label: ({ children }: { children: React.ReactNode }) => <label>{children}</label>,
  PageHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Panel: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  PanelHeader: () => null,
  SummaryMetric: () => null,
  TextareaPrimitive: () => <textarea />,
}))

vi.mock('@phiguard/compliance', () => ({
  VALID_TRANSITIONS: { reported: ['triaging'] },
}))

import { IncidentUpdateItem } from './$incidentId.js'

const baseDate = new Date('2024-06-01T12:00:00Z')

const makeUpdate = (overrides: Partial<{
  id: string
  tenantId: string
  incidentId: string
  authorId: string
  text: string
  createdAt: Date
  updatedAt: Date
  authorName: string
}> = {}) => ({
  id: 'update-1',
  tenantId: 'tenant-1',
  incidentId: 'incident-1',
  authorId: 'user-1',
  text: 'Some update text',
  createdAt: baseDate,
  updatedAt: baseDate,
  authorName: 'Dr. Jane Smith',
  ...overrides,
})

describe('IncidentUpdateItem', () => {
  it('renders the real author name instead of Staff member', () => {
    const update = makeUpdate({ authorName: 'Dr. Jane Smith' })
    const html = renderToString(<IncidentUpdateItem update={update} />)
    expect(html).toContain('Dr. Jane Smith')
    expect(html).not.toContain('Staff member')
  })

  it('renders email fallback author name', () => {
    const update = makeUpdate({ authorName: 'staff@clinic.test' })
    const html = renderToString(<IncidentUpdateItem update={update} />)
    expect(html).toContain('staff@clinic.test')
    expect(html).not.toContain('Staff member')
  })

  it('renders the timestamp in UTC so SSR and client hydration agree (React #418 guard)', () => {
    // baseDate is 2024-06-01T12:00:00Z. formatDate pins en-US/UTC, so this is
    // stable regardless of the test runner's local timezone — exactly what keeps
    // the server-rendered text matching the client and avoids a hydration mismatch.
    const update = makeUpdate({ createdAt: new Date('2024-06-01T12:00:00Z') })
    const html = renderToString(<IncidentUpdateItem update={update} />)
    expect(html).toContain('Jun 1, 2024')
    expect(html).toContain('12:00')
  })
})
