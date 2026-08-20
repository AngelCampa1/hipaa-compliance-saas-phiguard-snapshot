import { describe, it, expect, vi, beforeEach } from 'vitest'
import { exportEvidenceBundle } from '../../soc2/bundle-export.js'
import { setObjectStorageBindings } from '@phiguard/audit'

type ExportEvidenceBundleDb = Parameters<typeof exportEvidenceBundle>[0]

const { mockBucketPut, writeAuditEventMock } = vi.hoisted(() => ({
  mockBucketPut: vi.fn(),
  writeAuditEventMock: vi.fn(),
}))

vi.mock('@phiguard/audit', async () => {
  const actual = await vi.importActual<typeof import('@phiguard/audit')>('@phiguard/audit')
  return { ...actual, writeAuditEvent: writeAuditEventMock }
})

describe('exportEvidenceBundle', () => {
  let mockDb: ExportEvidenceBundleDb
  const tenantId = 'tenant-bundle-test'
  const actorId = 'user-actor-test'
  const from = new Date('2026-01-01T00:00:00Z')
  const to = new Date('2026-03-31T23:59:59Z')

  beforeEach(() => {
    vi.clearAllMocks()

    mockBucketPut.mockResolvedValue({})
    writeAuditEventMock.mockResolvedValue(undefined)
    setObjectStorageBindings({
      auditExports: {
        get: vi.fn(),
        head: vi.fn(),
        put: mockBucketPut,
      },
    })

    const evidenceRows = [
      {
        id: 'ev-1',
        tenantId,
        controlId: 'CC6.1',
        source: 'audit_log',
        metadata: { count: 10 },
        collectedAt: new Date('2026-02-01'),
      },
      {
        id: 'ev-2',
        tenantId,
        controlId: 'CC7.2',
        source: 'audit_log',
        metadata: { count: 5 },
        collectedAt: new Date('2026-02-15'),
      },
    ]
    const selectResults = [[{ id: 'membership-1' }], evidenceRows]
    let selectCallCount = 0

    const membershipSelectChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockImplementation(() => Promise.resolve(selectResults.shift() ?? [])),
    }
    const selectChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockImplementation(() => Promise.resolve(selectResults.shift() ?? [])),
    }

    const insertChain = {
      values: vi.fn().mockResolvedValue(undefined),
    }

    mockDb = {
      select: vi
        .fn()
        .mockImplementation(() => (selectCallCount++ === 0 ? membershipSelectChain : selectChain)),
      insert: vi.fn().mockReturnValue(insertChain),
    } as unknown as ExportEvidenceBundleDb
  })

  it('queries soc2_evidence rows and returns the bundle key', async () => {
    const result = await exportEvidenceBundle(mockDb, { tenantId, actorId, from, to })

    expect(mockDb.select).toHaveBeenCalled()
    expect(result).toMatchObject({
      key: expect.stringContaining(`soc2-bundles/${tenantId}/`),
    })
  })

  it('rejects invalid bundle window dates before querying evidence', async () => {
    await expect(
      exportEvidenceBundle(mockDb, {
        tenantId,
        actorId,
        from: new Date('not-a-date'),
        to,
      }),
    ).rejects.toThrow('Evidence bundle window dates must be valid')

    expect(mockDb.select).not.toHaveBeenCalled()
    expect(mockBucketPut).not.toHaveBeenCalled()
    expect(writeAuditEventMock).not.toHaveBeenCalled()
  })

  it('rejects reversed bundle windows before creating a bundle', async () => {
    await expect(
      exportEvidenceBundle(mockDb, {
        tenantId,
        actorId,
        from: new Date('2026-04-01T00:00:00Z'),
        to: new Date('2026-03-31T23:59:59Z'),
      }),
    ).rejects.toThrow('Evidence bundle window end must be on or after window start')

    expect(mockDb.select).not.toHaveBeenCalled()
    expect(mockBucketPut).not.toHaveBeenCalled()
    expect(writeAuditEventMock).not.toHaveBeenCalled()
  })

  it('rejects bundle export when the actor is not a tenant member', async () => {
    const selectResults: unknown[][] = [[]]
    const selectChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockImplementation(() => Promise.resolve(selectResults.shift() ?? [])),
    }
    mockDb = {
      select: vi.fn().mockReturnValue(selectChain),
      insert: vi.fn().mockReturnValue({ values: vi.fn().mockResolvedValue(undefined) }),
    } as unknown as ExportEvidenceBundleDb

    await expect(exportEvidenceBundle(mockDb, { tenantId, actorId, from, to })).rejects.toThrow(
      'SOC 2 bundle export actor is not a member of this organization',
    )

    expect(mockBucketPut).not.toHaveBeenCalled()
    expect(writeAuditEventMock).not.toHaveBeenCalled()
  })

  it('key ends with -evidence-bundle.json', async () => {
    const result = await exportEvidenceBundle(mockDb, { tenantId, actorId, from, to })
    expect(result.key).toMatch(/evidence-bundle\.json$/)
  })

  it('stores governance retention metadata with the bundle', async () => {
    await exportEvidenceBundle(mockDb, { tenantId, actorId, from, to })

    expect(mockBucketPut).toHaveBeenCalledWith(
      expect.stringContaining(`soc2-bundles/${tenantId}/`),
      expect.any(String),
      expect.objectContaining({
        customMetadata: expect.objectContaining({ retentionMode: 'GOVERNANCE' }),
      }),
    )
  })

  it('sets ObjectLockRetainUntilDate to approximately 7 years from now', async () => {
    const before = Date.now()
    await exportEvidenceBundle(mockDb, { tenantId, actorId, from, to })
    const after = Date.now()

    const sevenYearsMs = 7 * 365 * 24 * 60 * 60 * 1000
    const callArgs = mockBucketPut.mock.calls[0]?.[2] as { customMetadata: { retainUntil: string } }
    const retainUntil = new Date(callArgs.customMetadata.retainUntil)

    expect(retainUntil).toBeInstanceOf(Date)
    expect(retainUntil.getTime()).toBeGreaterThanOrEqual(before + sevenYearsMs)
    expect(retainUntil.getTime()).toBeLessThanOrEqual(after + sevenYearsMs)
  })

  it('writes a soc2.bundle_exported audit event after successful upload', async () => {
    const result = await exportEvidenceBundle(mockDb, { tenantId, actorId, from, to })

    expect(writeAuditEventMock).toHaveBeenCalledOnce()
    expect(writeAuditEventMock).toHaveBeenCalledWith(
      mockDb,
      expect.objectContaining({
        action: 'soc2.bundle_exported',
        tenantId,
        actorId,
        resourceType: 'soc2_bundle',
        resourceId: result.key,
      }),
    )
  })

  it('includes evidenceCount and s3Key in the audit event after payload', async () => {
    const result = await exportEvidenceBundle(mockDb, { tenantId, actorId, from, to })

    const auditCall = writeAuditEventMock.mock.calls[0]?.[1] as { after: Record<string, unknown> }
    expect(auditCall.after).toMatchObject({
      s3Key: result.key,
      evidenceCount: 2,
    })
  })

  it('excludes manual artifacts from exports until malware scanning passes', async () => {
    const evidenceRows = [
      {
        id: 'ev-clean',
        tenantId,
        controlId: 'CC6.1',
        source: 'manual_upload',
        fileKey: 'evidence/tenant-bundle-test/soc2/clean.pdf',
        metadata: { summary: 'Clean artifact' },
        collectedAt: new Date('2026-02-01'),
      },
      {
        id: 'ev-pending',
        tenantId,
        controlId: 'CC6.1',
        source: 'manual_upload',
        fileKey: 'evidence/tenant-bundle-test/soc2/pending.pdf',
        metadata: { summary: 'Pending artifact' },
        collectedAt: new Date('2026-02-02'),
      },
      {
        id: 'ev-audit',
        tenantId,
        controlId: 'CC7.2',
        source: 'audit_log',
        metadata: { count: 5 },
        collectedAt: new Date('2026-02-15'),
      },
    ]
    const scanRows = [
      { s3Key: 'evidence/tenant-bundle-test/soc2/clean.pdf', avStatus: 'clean' },
      { s3Key: 'evidence/tenant-bundle-test/soc2/pending.pdf', avStatus: 'pending' },
    ]
    const selectResults = [[{ id: 'membership-1' }], evidenceRows, scanRows]
    let selectCallCount = 0
    const membershipSelectChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockImplementation(() => Promise.resolve(selectResults.shift() ?? [])),
    }
    const selectChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockImplementation(() => Promise.resolve(selectResults.shift() ?? [])),
    }
    mockDb = {
      select: vi
        .fn()
        .mockImplementation(() => (selectCallCount++ === 0 ? membershipSelectChain : selectChain)),
      insert: vi.fn().mockReturnValue({ values: vi.fn().mockResolvedValue(undefined) }),
    } as unknown as ExportEvidenceBundleDb

    await exportEvidenceBundle(mockDb, { tenantId, actorId, from, to })

    const bundleJson = mockBucketPut.mock.calls[0]?.[1] as string
    const auditCall = writeAuditEventMock.mock.calls[0]?.[1] as { after: Record<string, unknown> }
    expect(bundleJson).toContain('ev-clean')
    expect(bundleJson).toContain('ev-audit')
    expect(bundleJson).not.toContain('ev-pending')
    expect(auditCall.after.evidenceCount).toBe(2)
  })

  it('excludes manual artifacts with invalid tenant-scoped keys even when scan state is clean', async () => {
    const evidenceRows = [
      {
        id: 'ev-valid',
        tenantId,
        controlId: 'CC6.1',
        source: 'manual_upload',
        fileKey: 'evidence/tenant-bundle-test/soc2/valid.pdf',
        metadata: { summary: 'Valid artifact' },
        collectedAt: new Date('2026-02-01'),
      },
      {
        id: 'ev-invalid',
        tenantId,
        controlId: 'CC6.1',
        source: 'manual_upload',
        fileKey: 'evidence/other-tenant/soc2/invalid.pdf',
        metadata: { summary: 'Invalid artifact' },
        collectedAt: new Date('2026-02-02'),
      },
    ]
    const scanRows = [
      { s3Key: 'evidence/tenant-bundle-test/soc2/valid.pdf', avStatus: 'clean' },
      { s3Key: 'evidence/other-tenant/soc2/invalid.pdf', avStatus: 'clean' },
    ]
    const selectResults = [[{ id: 'membership-1' }], evidenceRows, scanRows]
    let selectCallCount = 0
    const membershipSelectChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockImplementation(() => Promise.resolve(selectResults.shift() ?? [])),
    }
    const selectChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockImplementation(() => Promise.resolve(selectResults.shift() ?? [])),
    }
    mockDb = {
      select: vi
        .fn()
        .mockImplementation(() => (selectCallCount++ === 0 ? membershipSelectChain : selectChain)),
      insert: vi.fn().mockReturnValue({ values: vi.fn().mockResolvedValue(undefined) }),
    } as unknown as ExportEvidenceBundleDb

    await exportEvidenceBundle(mockDb, { tenantId, actorId, from, to })

    const bundleJson = mockBucketPut.mock.calls[0]?.[1] as string
    const auditCall = writeAuditEventMock.mock.calls[0]?.[1] as { after: Record<string, unknown> }
    expect(bundleJson).toContain('ev-valid')
    expect(bundleJson).not.toContain('ev-invalid')
    expect(auditCall.after.evidenceCount).toBe(1)
  })
})
