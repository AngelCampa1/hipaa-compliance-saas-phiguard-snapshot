/**
 * TDD: nightly object-storage export (per-tenant, keyset-paginated)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { gunzipSync } from 'node:zlib'

const mockBucketPut = vi.fn()
const ltMock = vi.hoisted(() => vi.fn())

vi.mock('drizzle-orm', async () => {
  const actual = await vi.importActual<typeof import('drizzle-orm')>('drizzle-orm')
  ltMock.mockImplementation(actual.lt)
  return {
    ...actual,
    lt: ltMock,
  }
})

// ---------------------------------------------------------------------------
// Mock DB
// ---------------------------------------------------------------------------

const tenantAEvents = [
  {
    id: 'evt-1',
    tenantId: 'tenant-abc',
    actorId: 'user-1',
    action: 'task.create',
    resourceType: 'task',
    resourceId: 'task-1',
    before: null,
    after: { title: 'Test task', status: 'open' },
    ip: '10.0.0.1',
    userAgent: 'TestAgent/1.0',
    createdAt: new Date('2026-04-13T08:00:00Z'),
  },
  {
    id: 'evt-2',
    tenantId: 'tenant-abc',
    actorId: 'user-2',
    action: 'incident.create',
    resourceType: 'incident',
    resourceId: 'inc-1',
    before: null,
    after: { title: 'Lost device', severity: 'high' },
    ip: '10.0.0.2',
    userAgent: 'TestAgent/1.0',
    createdAt: new Date('2026-04-13T09:00:00Z'),
  },
]

// Shared mock chain state - reset per test
let mockWhereResult: unknown[] = []
let mockDistinctWhereResult: unknown[] = []

const mockWhere = vi.fn()
const mockOrderBy = vi.fn()
const mockLimit = vi.fn()
const mockFrom = vi.fn()
const mockSelect = vi.fn()
const mockDistinctWhere = vi.fn()
const mockDistinctFrom = vi.fn()
const mockSelectDistinct = vi.fn()

function setupMockChain() {
  mockLimit.mockImplementation(() => Promise.resolve(mockWhereResult))
  mockOrderBy.mockReturnValue({ limit: mockLimit })
  mockWhere.mockReturnValue({ orderBy: mockOrderBy })
  mockFrom.mockReturnValue({ where: mockWhere })
  mockSelect.mockReturnValue({ from: mockFrom })

  mockDistinctWhere.mockResolvedValue(mockDistinctWhereResult)
  mockDistinctFrom.mockReturnValue({ where: mockDistinctWhere })
  mockSelectDistinct.mockReturnValue({ from: mockDistinctFrom })
}

const mockDb = {
  select: mockSelect,
  selectDistinct: mockSelectDistinct,
}

// ---------------------------------------------------------------------------
// Import module under test
// ---------------------------------------------------------------------------

import { runNightlyExport } from './nightly.js'
import { setObjectStorageBindings } from '../object-storage.js'

beforeEach(() => {
  vi.clearAllMocks()
  mockWhereResult = tenantAEvents
  mockDistinctWhereResult = [{ tenantId: 'tenant-abc' }]
  setupMockChain()
  setObjectStorageBindings({
    auditExports: {
      get: vi.fn(),
      head: vi.fn(),
      put: mockBucketPut,
    },
  })
  mockBucketPut.mockResolvedValue({})
})

afterEach(() => {
  setObjectStorageBindings()
  vi.restoreAllMocks()
})

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('runNightlyExport', () => {
  it('discovers tenants via selectDistinct and queries per tenant', async () => {
    await runNightlyExport(mockDb as never, {
      bucket: 'test-bucket',
      region: 'us-east-1',
    })

    expect(mockSelectDistinct).toHaveBeenCalled()
    expect(mockDistinctFrom).toHaveBeenCalled()
    expect(mockDistinctWhere).toHaveBeenCalled()
  })

  it('bounds tenant discovery and export pages to the run start time', async () => {
    const fixedDate = new Date('2026-04-13T23:00:00.000Z')
    vi.useFakeTimers()
    vi.setSystemTime(fixedDate)

    try {
      await runNightlyExport(mockDb as never, {
        bucket: 'test-bucket',
        region: 'us-east-1',
      })
    } finally {
      vi.useRealTimers()
    }

    expect(ltMock).toHaveBeenCalledWith(expect.anything(), new Date('2026-04-13T00:00:00.000Z'))
    expect(ltMock).toHaveBeenCalledTimes(2)
  })

  it('uploads one object-storage object per tenant with ContentEncoding: gzip', async () => {
    await runNightlyExport(mockDb as never, {
      bucket: 'test-bucket',
      region: 'us-east-1',
    })

    // One tenant → one upload
    expect(mockBucketPut).toHaveBeenCalledOnce()

    const putCall = mockBucketPut.mock.calls[0]
    expect(putCall).toBeDefined()
    expect(putCall[2].httpMetadata.contentEncoding).toBe('gzip')
    expect(putCall[2].httpMetadata.contentType).toBe('application/x-ndjson')
    expect(putCall[2].customMetadata.retentionMode).toBe('COMPLIANCE')
    const sixYearsMs = 2190 * 24 * 60 * 60 * 1000
    const retainUntil = new Date(putCall[2].customMetadata.retainUntil)
    expect(retainUntil.getTime()).toBeGreaterThan(Date.now() + sixYearsMs - 60_000)
    expect(retainUntil.getTime()).toBeLessThan(Date.now() + sixYearsMs + 60_000)
  })

  it('uses the correct object key format: exports/{YYYY}/{MM}/{DD}/{tenantId}/audit-{YYYY-MM-DD}.jsonl.gz', async () => {
    const fixedDate = new Date('2026-04-13T23:00:00.000Z')
    vi.useFakeTimers()
    vi.setSystemTime(fixedDate)

    try {
      await runNightlyExport(mockDb as never, {
        bucket: 'test-bucket',
        region: 'us-east-1',
      })
    } finally {
      vi.useRealTimers()
    }

    const key: string = mockBucketPut.mock.calls[0]?.[0]

    expect(key).toMatch(/^exports\/\d{4}\/\d{2}\/\d{2}\/[^/]+\/audit-\d{4}-\d{2}-\d{2}\.jsonl\.gz$/)
    expect(key).toContain('exports/2026/04/12/tenant-abc/')
    expect(key).toBe('exports/2026/04/12/tenant-abc/audit-2026-04-12.jsonl.gz')
  })

  it('uses a deterministic tenant/day object key across same-day reruns', async () => {
    vi.useFakeTimers()

    try {
      vi.setSystemTime(new Date('2026-04-13T23:00:00.000Z'))
      await runNightlyExport(mockDb as never, {
        bucket: 'test-bucket',
        region: 'us-east-1',
      })

      vi.setSystemTime(new Date('2026-04-13T23:30:00.000Z'))
      await runNightlyExport(mockDb as never, {
        bucket: 'test-bucket',
        region: 'us-east-1',
      })
    } finally {
      vi.useRealTimers()
    }

    const keys = mockBucketPut.mock.calls.map((call) => call[0] as string)
    expect(keys).toEqual([
      'exports/2026/04/12/tenant-abc/audit-2026-04-12.jsonl.gz',
      'exports/2026/04/12/tenant-abc/audit-2026-04-12.jsonl.gz',
    ])
    for (const call of mockBucketPut.mock.calls) {
      expect(call[2].onlyIf).toEqual({ etagDoesNotMatch: '*' })
    }
  })

  it('produces gzip-compressed JSONL content', async () => {
    await runNightlyExport(mockDb as never, {
      bucket: 'test-bucket',
      region: 'us-east-1',
    })

    const body: Buffer = mockBucketPut.mock.calls[0]?.[1] as Buffer

    expect(Buffer.isBuffer(body)).toBe(true)

    const decompressed = gunzipSync(body).toString('utf-8')
    const lines = decompressed.trim().split('\n')
    expect(lines).toHaveLength(tenantAEvents.length)

    for (const line of lines) {
      const parsed = JSON.parse(line)
      expect(parsed).toHaveProperty('id')
      expect(parsed).toHaveProperty('action')
      expect(parsed).toHaveProperty('tenantId')
    }
  })

  it('does not upload when there are no events for any tenant', async () => {
    // Override: no tenants have events in the window
    mockSelectDistinct.mockReturnValue({
      from: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue([]) }),
    })

    await expect(
      runNightlyExport(mockDb as never, {
        bucket: 'test-bucket',
        region: 'us-east-1',
      }),
    ).resolves.not.toThrow()

    // No tenants discovered → no uploads
    expect(mockBucketPut).not.toHaveBeenCalled()
  })

  it('continues exporting remaining tenants when one object upload fails, then throws aggregate error', async () => {
    const tenantBEvent = { ...tenantAEvents[0], id: 'evt-b', tenantId: 'tenant-xyz' }

    mockSelectDistinct.mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([{ tenantId: 'tenant-abc' }, { tenantId: 'tenant-xyz' }]),
      }),
    })

    let callCount = 0
    mockLimit.mockImplementation(() => {
      callCount++
      if (callCount === 1) return Promise.resolve(tenantAEvents)
      if (callCount === 2) return Promise.resolve([tenantBEvent])
      return Promise.resolve([])
    })

    // First tenant upload fails, second succeeds
    mockBucketPut.mockRejectedValueOnce(new Error('Object storage unavailable')).mockResolvedValueOnce({})

    await expect(
      runNightlyExport(mockDb as never, { bucket: 'test-bucket', region: 'us-east-1' }),
    ).rejects.toThrow(/tenant-abc/)

    // Both tenants were attempted
    expect(mockBucketPut).toHaveBeenCalledTimes(2)
  })

  it('uploads one object-storage object per tenant when multiple tenants have events', async () => {
    const tenantBEvent = { ...tenantAEvents[0], id: 'evt-b', tenantId: 'tenant-xyz' }

    // Override: two tenants discovered
    mockSelectDistinct.mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([{ tenantId: 'tenant-abc' }, { tenantId: 'tenant-xyz' }]),
      }),
    })

    // First page call → tenantA events; second → tenantB event; rest → empty
    let callCount = 0
    mockLimit.mockImplementation(() => {
      callCount++
      if (callCount === 1) return Promise.resolve(tenantAEvents)
      if (callCount === 2) return Promise.resolve([tenantBEvent])
      return Promise.resolve([])
    })

    await runNightlyExport(mockDb as never, {
      bucket: 'test-bucket',
      region: 'us-east-1',
    })

    expect(mockBucketPut).toHaveBeenCalledTimes(2)

    const keys = mockBucketPut.mock.calls.map((call) => call[0] as string)
    expect(keys.some((k) => k.includes('tenant-abc'))).toBe(true)
    expect(keys.some((k) => k.includes('tenant-xyz'))).toBe(true)
  })
})
