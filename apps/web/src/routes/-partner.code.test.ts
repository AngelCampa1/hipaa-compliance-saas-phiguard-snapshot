import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@tanstack/react-router', () => ({
  createFileRoute: vi.fn(() => vi.fn(() => ({}))),
}))

vi.mock('drizzle-orm', () => ({
  and: vi.fn((...clauses: unknown[]) => ({ op: 'and', clauses })),
  eq: vi.fn((column: unknown, value: unknown) => ({ op: 'eq', column, value })),
}))

vi.mock('@phiguard/db/server', () => ({
  getDb: vi.fn(),
  partners: {
    referralCode: 'referralCode',
    status: 'status',
  },
}))

vi.mock('@phiguard/billing', () => ({
  buildReferralCookieHeader: vi.fn((referralCode: string) => {
    return `pg_ref=${referralCode}; HttpOnly; SameSite=Lax; Max-Age=7776000; Path=/`
  }),
}))

import { getDb } from '@phiguard/db/server'
import { handlePartnerReferral } from './partner.$code.js'

const REFERRAL_COOKIE_NAME = 'pg_ref'

function makeDbMock(rows: Array<{ referralCode: string; status: string }>) {
  let condition: unknown
  const readConditionValue = (node: unknown, columnName: string): unknown => {
    if (!node || typeof node !== 'object') return undefined
    const typedNode = node as {
      op?: string
      column?: string
      value?: unknown
      clauses?: unknown[]
    }

    if (typedNode.op === 'eq' && typedNode.column === columnName) {
      return typedNode.value
    }

    if (typedNode.op === 'and' && Array.isArray(typedNode.clauses)) {
      for (const clause of typedNode.clauses) {
        const value = readConditionValue(clause, columnName)
        if (value !== undefined) return value
      }
    }

    return undefined
  }
  const limit = vi.fn().mockImplementation(async () => {
    const referralCode = readConditionValue(condition, 'referralCode')
    const status = readConditionValue(condition, 'status')

    return rows.filter((row) => {
      return (
        (referralCode === undefined || row.referralCode === referralCode) &&
        (status === undefined || row.status === status)
      )
    })
  })
  const where = vi.fn().mockReturnValue({ limit })
  where.mockImplementation((nextCondition: unknown) => {
    condition = nextCondition
    return { limit }
  })
  const from = vi.fn().mockReturnValue({ where })
  const select = vi.fn().mockReturnValue({ from })

  return {
    select,
    _mocks: { where },
  }
}

describe('handlePartnerReferral', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('sets a referral cookie for active partner codes', async () => {
    const db = makeDbMock([{ referralCode: 'ACTIVE123', status: 'active' }])
    vi.mocked(getDb).mockReturnValue(db as never)

    const response = await handlePartnerReferral('ACTIVE123')

    expect(response.status).toBe(302)
    expect(response.headers.get('location')).toBe('/signup')
    expect(response.headers.get('set-cookie')).toContain(`${REFERRAL_COOKIE_NAME}=ACTIVE123`)
  })

  it.each([
    ['unknown', 'UNKNOWN123', []],
    ['pending', 'PENDING123', [{ referralCode: 'PENDING123', status: 'pending' }]],
    ['inactive', 'INACTIVE123', [{ referralCode: 'INACTIVE123', status: 'inactive' }]],
  ])('redirects %s partner codes without setting attribution', async (_label, code, rows) => {
    const db = makeDbMock(rows)
    vi.mocked(getDb).mockReturnValue(db as never)

    const response = await handlePartnerReferral(code)

    expect(response.status).toBe(302)
    expect(response.headers.get('location')).toBe('/signup')
    expect(response.headers.has('set-cookie')).toBe(false)
  })
})
