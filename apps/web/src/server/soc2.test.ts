import { beforeEach, describe, expect, it, vi } from 'vitest'

const {
  collectAuditEvidenceMock,
  buildMockUploadUrlMock,
  generatePresignedDownloadUrlMock,
  assertEvidenceFileScanCleanMock,
  recordEvidenceFileScanPendingMock,
  dispatchAttachmentScanRequestMock,
  assertObjectExistsMock,
  getDbMock,
  getAuditExportsBucketBindingMock,
  getSessionFnMock,
  listControlsMock,
  isMockUploadsEnabledMock,
  requireAttachmentsBucketNameMock,
  requireFeatureForOrgMock,
  recordFeatureUsageMock,
  resolveActiveLocationAccessMock,
  runInAuditContextMock,
} = vi.hoisted(() => ({
  collectAuditEvidenceMock: vi.fn(),
  buildMockUploadUrlMock: vi.fn(
    (key: string) => `/api/uploads/mock?key=${encodeURIComponent(key)}`,
  ),
  generatePresignedDownloadUrlMock: vi.fn(),
  assertEvidenceFileScanCleanMock: vi.fn(),
  recordEvidenceFileScanPendingMock: vi.fn(),
  dispatchAttachmentScanRequestMock: vi.fn(),
  assertObjectExistsMock: vi.fn(),
  getDbMock: vi.fn(),
  getAuditExportsBucketBindingMock: vi.fn(),
  getSessionFnMock: vi.fn(),
  listControlsMock: vi.fn(),
  isMockUploadsEnabledMock: vi.fn(),
  requireAttachmentsBucketNameMock: vi.fn(),
  requireFeatureForOrgMock: vi.fn(),
  recordFeatureUsageMock: vi.fn(),
  resolveActiveLocationAccessMock: vi.fn(),
  runInAuditContextMock: vi.fn(async (_actorId: string, fn: () => Promise<unknown>) => fn()),
}))

vi.mock('@tanstack/react-start', () => ({
  createServerFn: vi.fn(() => ({
    inputValidator: vi.fn().mockReturnThis(),
    handler: vi.fn((fn) => fn),
  })),
}))

vi.mock('drizzle-orm', () => ({
  and: vi.fn((...clauses: unknown[]) => ({ op: 'and', clauses })),
  count: vi.fn(() => ({ op: 'count' })),
  eq: vi.fn((column: unknown, value: unknown) => ({ op: 'eq', column, value })),
  inArray: vi.fn((column: unknown, values: unknown[]) => ({ op: 'inArray', column, values })),
}))

vi.mock('@phiguard/db/server', () => ({
  getDb: getDbMock,
  organizations: {
    id: 'organizationId',
    plan: 'plan',
    planStatus: 'planStatus',
    trialEndsAt: 'trialEndsAt',
  },
  soc2Evidence: {
    id: 'id',
    controlId: 'controlId',
    fileKey: 'fileKey',
    tenantId: 'tenantId',
  },
  evidenceFileScans: {
    avStatus: 'avStatus',
    s3Key: 's3Key',
    tenantId: 'tenantId',
  },
  accessReviews: {},
  accessReviewItems: {},
  memberships: {},
  users: {},
}))

vi.mock('@phiguard/billing', () => ({
  recordFeatureUsage: recordFeatureUsageMock,
  requireFeatureForOrg: requireFeatureForOrgMock,
}))

vi.mock('../lib/attachment-scan.js', () => ({
  dispatchAttachmentScanRequest: dispatchAttachmentScanRequestMock,
}))

vi.mock('../lib/evidence-file-scan.js', () => ({
  assertEvidenceFileScanClean: assertEvidenceFileScanCleanMock,
  recordEvidenceFileScanPending: recordEvidenceFileScanPendingMock,
}))

vi.mock('@phiguard/compliance', () => ({
  CONTROL_AUDIT_MAP: {
    'CC6.1': ['invitation.accepted', 'member.role_updated'],
  },
  closeAccessReview: vi.fn(),
  collectAuditEvidence: collectAuditEvidenceMock,
  exportEvidenceBundle: vi.fn(),
  getManualEvidenceFileKeyPrefix: vi.fn((tenantId: string) => `evidence/${tenantId}/soc2/`),
  listControls: listControlsMock,
  openAccessReview: vi.fn(),
  recordDecision: vi.fn(),
  recordManualEvidence: vi.fn(),
  validateManualEvidenceFileKey: vi.fn((key: string, tenantId: string) => {
    const trimmedKey = key.trim()
    const prefix = `evidence/${tenantId}/soc2/`
    if (!trimmedKey.startsWith(prefix) || trimmedKey.length === prefix.length) {
      throw new Error(`Evidence file key must start with ${prefix}`)
    }
    return trimmedKey
  }),
}))

vi.mock('@phiguard/audit', () => ({
  getAuditExportsBucketBinding: getAuditExportsBucketBindingMock,
}))

vi.mock('@phiguard/auth', () => ({
  canAccessSoc2: vi.fn((role: string) => role === 'org_admin' || role === 'auditor'),
}))

vi.mock('../lib/audit.server.js', () => ({
  runInAuditContext: runInAuditContextMock,
}))

vi.mock('../lib/object-storage.js', () => ({
  applyObjectStorageHttpMetadata: vi.fn(),
}))

vi.mock('../lib/s3.js', () => ({
  ALLOWED_UPLOAD_CONTENT_TYPES: new Set(['application/pdf', 'text/plain']),
  MAX_UPLOAD_BYTES: 25 * 1024 * 1024,
  assertObjectExists: assertObjectExistsMock,
  buildMockUploadUrl: buildMockUploadUrlMock,
  buildSoc2BundleDownloadUrl: vi.fn(),
  buildSoc2EvidenceKey: vi.fn(),
  generatePresignedDownloadUrl: generatePresignedDownloadUrlMock,
  generatePresignedUploadUrl: vi.fn(),
  isMockUploadsEnabled: isMockUploadsEnabledMock,
  requireAttachmentsBucketName: requireAttachmentsBucketNameMock,
}))

vi.mock('../lib/session.js', () => ({
  getSessionFn: getSessionFnMock,
}))

vi.mock('./access.js', () => ({
  assertCommercialProductAccess: vi.fn(),
  canManageOrganization: vi.fn((access: { role: string }) => access.role === 'org_admin'),
  resolveActiveLocationAccess: resolveActiveLocationAccessMock,
}))

import {
  collectAuditEvidenceFn,
  createEvidenceBundleDownloadResponse,
  downloadSoc2EvidenceFn,
  listEvidenceFn,
  recordManualEvidenceFn,
} from './soc2.js'

function makeDb(results: unknown[][] = []) {
  return {
    select: vi.fn().mockReturnValue({
      from: vi.fn().mockReturnThis(),
      innerJoin: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      then: vi.fn((resolve, reject) =>
        Promise.resolve(results.shift() ?? []).then(resolve, reject),
      ),
      limit: vi.fn().mockImplementation(() =>
        Promise.resolve(
          results.shift() ?? [
            {
              plan: 'group',
              planStatus: 'active',
              trialEndsAt: null,
            },
          ],
        ),
      ),
    }),
  }
}

describe('collectAuditEvidenceFn', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getSessionFnMock.mockResolvedValue({
      user: { id: 'user-1' },
      session: { activeOrganizationId: 'org-1' },
    })
    getDbMock.mockReturnValue(makeDb())
    requireFeatureForOrgMock.mockImplementation(() => undefined)
    resolveActiveLocationAccessMock.mockResolvedValue({
      role: 'org_admin',
      userId: 'user-1',
      organizationId: 'org-1',
    })
    collectAuditEvidenceMock.mockResolvedValue({ evidenceId: 'evidence-1', count: 3 })
    generatePresignedDownloadUrlMock.mockResolvedValue('https://signed-download.example')
    requireAttachmentsBucketNameMock.mockReturnValue('attachments-bucket')
  })

  it('collects mapped audit evidence for administrators using the active tenant', async () => {
    await expect(
      collectAuditEvidenceFn({
        data: {
          controlId: 'CC6.1',
          from: '2026-01-01T00:00:00.000Z',
          to: '2026-03-31T23:59:59.000Z',
        },
      }),
    ).resolves.toEqual({ evidenceId: 'evidence-1', count: 3 })

    expect(collectAuditEvidenceMock).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        tenantId: 'org-1',
        controlId: 'CC6.1',
        actionFilters: ['invitation.accepted', 'member.role_updated'],
      }),
    )
  })

  it('collects audit evidence for the resolved tenant when the session active tenant is stale', async () => {
    getSessionFnMock.mockResolvedValue({
      user: { id: 'user-1' },
      session: { activeOrganizationId: 'org-stale' },
    })
    resolveActiveLocationAccessMock.mockResolvedValueOnce({
      role: 'org_admin',
      userId: 'user-1',
      organizationId: 'org-1',
    })

    await expect(
      collectAuditEvidenceFn({
        data: {
          controlId: 'CC6.1',
          from: '2026-01-01T00:00:00.000Z',
          to: '2026-03-31T23:59:59.000Z',
        },
      }),
    ).resolves.toEqual({ evidenceId: 'evidence-1', count: 3 })

    expect(collectAuditEvidenceMock).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        tenantId: 'org-1',
      }),
    )
  })

  it('blocks auditors from collecting audit evidence', async () => {
    resolveActiveLocationAccessMock.mockResolvedValueOnce({
      role: 'auditor',
      userId: 'user-1',
      organizationId: 'org-1',
    })

    await expect(
      collectAuditEvidenceFn({
        data: {
          controlId: 'CC6.1',
          from: '2026-01-01T00:00:00.000Z',
          to: '2026-03-31T23:59:59.000Z',
        },
      }),
    ).rejects.toThrow('Only administrators can collect audit evidence')

    expect(collectAuditEvidenceMock).not.toHaveBeenCalled()
  })

  it('rejects unmapped and prototype control IDs before collecting evidence', async () => {
    await expect(
      collectAuditEvidenceFn({
        data: {
          controlId: 'constructor',
          from: '2026-01-01T00:00:00.000Z',
          to: '2026-03-31T23:59:59.000Z',
        },
      }),
    ).rejects.toThrow('SOC 2 control does not have audit evidence mapping')

    expect(collectAuditEvidenceMock).not.toHaveBeenCalled()
  })
})

describe('downloadSoc2EvidenceFn', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getSessionFnMock.mockResolvedValue({
      user: { id: 'user-1' },
      session: { activeOrganizationId: 'org-1' },
    })
    requireFeatureForOrgMock.mockImplementation(() => undefined)
    resolveActiveLocationAccessMock.mockResolvedValue({
      role: 'auditor',
      userId: 'user-1',
      organizationId: 'org-1',
    })
    generatePresignedDownloadUrlMock.mockResolvedValue('https://signed-download.example')
    isMockUploadsEnabledMock.mockReturnValue(false)
    requireAttachmentsBucketNameMock.mockReturnValue('attachments-bucket')
  })

  it('lets auditors download tenant-scoped manual SOC 2 evidence artifacts', async () => {
    getDbMock.mockReturnValue(
      makeDb([
        [{ plan: 'group', planStatus: 'active', trialEndsAt: null }],
        [{ id: 'evidence-1', fileKey: 'evidence/org-1/soc2/access-review.pdf' }],
      ]),
    )

    await expect(
      downloadSoc2EvidenceFn({
        data: { evidenceId: '11111111-1111-4111-8111-111111111111' },
      }),
    ).resolves.toEqual({ downloadUrl: 'https://signed-download.example' })

    expect(generatePresignedDownloadUrlMock).toHaveBeenCalledWith({
      bucket: 'attachments-bucket',
      key: 'evidence/org-1/soc2/access-review.pdf',
      organizationId: 'org-1',
      expiresIn: 900,
    })
  })

  it('downloads mock SOC 2 evidence artifacts without configured attachment storage', async () => {
    isMockUploadsEnabledMock.mockReturnValue(true)
    requireAttachmentsBucketNameMock.mockImplementation(() => {
      throw new Error('Attachment storage is not configured')
    })
    getDbMock.mockReturnValue(
      makeDb([
        [{ plan: 'group', planStatus: 'active', trialEndsAt: null }],
        [{ id: 'evidence-1', fileKey: 'evidence/org-1/soc2/access-review.pdf' }],
      ]),
    )

    await expect(
      downloadSoc2EvidenceFn({
        data: { evidenceId: '11111111-1111-4111-8111-111111111111' },
      }),
    ).resolves.toEqual({
      downloadUrl: '/api/uploads/mock?key=evidence%2Forg-1%2Fsoc2%2Faccess-review.pdf',
    })

    expect(requireAttachmentsBucketNameMock).not.toHaveBeenCalled()
    expect(assertEvidenceFileScanCleanMock).not.toHaveBeenCalled()
    expect(generatePresignedDownloadUrlMock).not.toHaveBeenCalled()
  })

  it('does not sign SOC 2 evidence artifacts outside the active tenant prefix', async () => {
    getDbMock.mockReturnValue(
      makeDb([
        [{ plan: 'group', planStatus: 'active', trialEndsAt: null }],
        [{ id: 'evidence-1', fileKey: 'evidence/org-2/soc2/access-review.pdf' }],
      ]),
    )

    await expect(
      downloadSoc2EvidenceFn({
        data: { evidenceId: '11111111-1111-4111-8111-111111111111' },
      }),
    ).rejects.toThrow('Invalid SOC 2 evidence key')

    expect(generatePresignedDownloadUrlMock).not.toHaveBeenCalled()
  })

  it('lets administrators download tenant-scoped manual SOC 2 evidence artifacts', async () => {
    resolveActiveLocationAccessMock.mockResolvedValueOnce({
      role: 'org_admin',
      userId: 'user-1',
      organizationId: 'org-1',
    })
    getDbMock.mockReturnValue(
      makeDb([
        [{ plan: 'group', planStatus: 'active', trialEndsAt: null }],
        [{ id: 'evidence-1', fileKey: 'evidence/org-1/soc2/access-review.pdf' }],
      ]),
    )

    await expect(
      downloadSoc2EvidenceFn({
        data: { evidenceId: '11111111-1111-4111-8111-111111111111' },
      }),
    ).resolves.toEqual({ downloadUrl: 'https://signed-download.example' })

    expect(generatePresignedDownloadUrlMock).toHaveBeenCalledWith({
      bucket: 'attachments-bucket',
      key: 'evidence/org-1/soc2/access-review.pdf',
      organizationId: 'org-1',
      expiresIn: 900,
    })
  })

  it('does not sign audit-log SOC 2 evidence without an artifact key', async () => {
    getDbMock.mockReturnValue(
      makeDb([
        [{ plan: 'group', planStatus: 'active', trialEndsAt: null }],
        [{ id: 'evidence-1', fileKey: null }],
      ]),
    )

    await expect(
      downloadSoc2EvidenceFn({
        data: { evidenceId: '11111111-1111-4111-8111-111111111111' },
      }),
    ).rejects.toThrow('SOC 2 evidence artifact not found')

    expect(generatePresignedDownloadUrlMock).not.toHaveBeenCalled()
  })
})

describe('createEvidenceBundleDownloadResponse', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getSessionFnMock.mockResolvedValue({
      user: { id: 'user-1' },
      session: { activeOrganizationId: 'org-1' },
    })
    requireFeatureForOrgMock.mockImplementation(() => undefined)
    resolveActiveLocationAccessMock.mockResolvedValue({
      role: 'org_admin',
      userId: 'user-1',
      organizationId: 'org-1',
    })
    getDbMock.mockReturnValue(
      makeDb([[{ plan: 'group', planStatus: 'active', trialEndsAt: null }]]),
    )
  })

  it('sanitizes bundle download filenames before writing Content-Disposition', async () => {
    getAuditExportsBucketBindingMock.mockReturnValue({
      get: vi.fn().mockResolvedValue({
        body: '{"ok":true}',
      }),
    })

    const response = await createEvidenceBundleDownloadResponse(
      new Request(
        'https://app.phiguard.test/api/soc2/bundles?key=soc2-bundles/org-1/bad%22name%0D%0A.json',
      ),
    )

    expect(response.status).toBe(200)
    expect(response.headers.get('Content-Disposition')).toBe(
      'attachment; filename="bad_name__.json"',
    )
  })
})

describe('recordManualEvidenceFn', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getSessionFnMock.mockResolvedValue({
      user: { id: 'user-1' },
      session: { activeOrganizationId: 'org-1' },
    })
    getDbMock.mockReturnValue(makeDb())
    requireFeatureForOrgMock.mockImplementation(() => undefined)
    resolveActiveLocationAccessMock.mockResolvedValue({
      role: 'org_admin',
      userId: 'user-1',
      organizationId: 'org-1',
    })
    requireAttachmentsBucketNameMock.mockReturnValue('attachments-bucket')
    assertObjectExistsMock.mockResolvedValue({
      contentType: 'application/pdf',
      sizeBytes: 128,
    })
    listControlsMock.mockResolvedValue([
      {
        id: 'control-1',
        controlId: 'CC6.1',
        title: 'Logical access',
      },
    ])
  })

  it('dispatches manual SOC 2 evidence scans with stored object metadata', async () => {
    await recordManualEvidenceFn({
      data: {
        controlId: 'CC6.1',
        fileKey: 'evidence/org-1/soc2/access-review.pdf',
        summary: 'Access review export',
      },
    })

    expect(assertObjectExistsMock).toHaveBeenCalledWith({
      bucket: 'attachments-bucket',
      key: 'evidence/org-1/soc2/access-review.pdf',
      maxBytes: 25 * 1024 * 1024,
    })
    expect(dispatchAttachmentScanRequestMock).toHaveBeenCalledWith({
      organizationId: 'org-1',
      key: 'evidence/org-1/soc2/access-review.pdf',
      bucket: 'attachments-bucket',
      contentType: 'application/pdf',
      sizeBytes: 128,
    })
  })

  it('does not create scan state or dispatch scanner work for unknown controls', async () => {
    listControlsMock.mockResolvedValue([
      {
        id: 'control-1',
        controlId: 'CC6.1',
        title: 'Logical access',
      },
    ])

    await expect(
      recordManualEvidenceFn({
        data: {
          controlId: 'CC99.9',
          fileKey: 'evidence/org-1/soc2/access-review.pdf',
          summary: 'Access review export',
        },
      }),
    ).rejects.toThrow('SOC 2 control not found')

    expect(assertObjectExistsMock).not.toHaveBeenCalled()
    expect(recordEvidenceFileScanPendingMock).not.toHaveBeenCalled()
    expect(dispatchAttachmentScanRequestMock).not.toHaveBeenCalled()
  })
})

describe('listEvidenceFn', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getSessionFnMock.mockResolvedValue({
      user: { id: 'user-1' },
      session: { activeOrganizationId: 'org-1' },
    })
    requireFeatureForOrgMock.mockImplementation(() => undefined)
    resolveActiveLocationAccessMock.mockResolvedValue({
      role: 'auditor',
      userId: 'user-1',
      organizationId: 'org-1',
    })
    listControlsMock.mockResolvedValue([
      {
        id: 'control-1',
        controlId: 'CC6.1',
        title: 'Logical access',
      },
    ])
  })

  it('exposes artifact availability without returning raw storage keys', async () => {
    getDbMock.mockReturnValue(
      makeDb([
        [{ plan: 'group', planStatus: 'active', trialEndsAt: null }],
        [
          {
            id: 'evidence-1',
            tenantId: 'org-1',
            controlId: 'CC6.1',
            source: 'manual_upload',
            collectedAt: new Date('2026-04-01T00:00:00.000Z'),
            fileKey: 'evidence/org-1/soc2/access-review.pdf',
            queryRef: 'Access review',
            metadata: { summary: 'Access review' },
            createdAt: new Date('2026-04-01T00:00:00.000Z'),
            updatedAt: new Date('2026-04-01T00:00:00.000Z'),
          },
        ],
        [{ s3Key: 'evidence/org-1/soc2/access-review.pdf', avStatus: 'clean' }],
      ]),
    )

    const result = await listEvidenceFn({ data: {} })

    expect(result.evidence[0]).toMatchObject({
      id: 'evidence-1',
      hasArtifact: true,
    })
    expect(result.evidence[0]).not.toHaveProperty('fileKey')
  })

  it('does not mark pending manual evidence artifacts as downloadable', async () => {
    getDbMock.mockReturnValue(
      makeDb([
        [{ plan: 'group', planStatus: 'active', trialEndsAt: null }],
        [
          {
            id: 'evidence-1',
            tenantId: 'org-1',
            controlId: 'CC6.1',
            source: 'manual_upload',
            collectedAt: new Date('2026-04-01T00:00:00.000Z'),
            fileKey: 'evidence/org-1/soc2/access-review.pdf',
            queryRef: 'Access review',
            metadata: { summary: 'Access review' },
            createdAt: new Date('2026-04-01T00:00:00.000Z'),
            updatedAt: new Date('2026-04-01T00:00:00.000Z'),
          },
        ],
        [{ s3Key: 'evidence/org-1/soc2/access-review.pdf', avStatus: 'pending' }],
      ]),
    )

    const result = await listEvidenceFn({ data: {} })

    expect(result.evidence[0]).toMatchObject({
      id: 'evidence-1',
      artifactScanStatus: 'pending',
      hasArtifact: false,
    })
    expect(result.evidence[0]).not.toHaveProperty('fileKey')
  })

  it('does not mark invalid manual evidence artifact keys as downloadable even when scan state is clean', async () => {
    getDbMock.mockReturnValue(
      makeDb([
        [{ plan: 'group', planStatus: 'active', trialEndsAt: null }],
        [
          {
            id: 'evidence-1',
            tenantId: 'org-1',
            controlId: 'CC6.1',
            source: 'manual_upload',
            collectedAt: new Date('2026-04-01T00:00:00.000Z'),
            fileKey: 'evidence/org-2/soc2/access-review.pdf',
            queryRef: 'Access review',
            metadata: { summary: 'Access review' },
            createdAt: new Date('2026-04-01T00:00:00.000Z'),
            updatedAt: new Date('2026-04-01T00:00:00.000Z'),
          },
        ],
        [{ s3Key: 'evidence/org-2/soc2/access-review.pdf', avStatus: 'clean' }],
      ]),
    )

    const result = await listEvidenceFn({ data: {} })

    expect(result.evidence[0]).toMatchObject({
      id: 'evidence-1',
      artifactScanStatus: 'invalid',
      hasArtifact: false,
    })
    expect(result.evidence[0]).not.toHaveProperty('fileKey')
  })

  it('does not query evidence for unknown control filters', async () => {
    const db = makeDb([[{ plan: 'group', planStatus: 'active', trialEndsAt: null }]])
    getDbMock.mockReturnValue(db)

    await expect(listEvidenceFn({ data: { controlId: 'CC99.9' } })).resolves.toMatchObject({
      evidence: [],
    })

    expect(listControlsMock).toHaveBeenCalledWith(db, { tenantId: 'org-1' })
    expect(db.select).toHaveBeenCalledTimes(1)
  })
})
