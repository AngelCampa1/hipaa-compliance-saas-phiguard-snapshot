import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import type { AppSession } from '../lib/session.js'
import { STARTER_TEMPLATES } from '@phiguard/compliance'
import { memberships } from '@phiguard/db/server'

const {
  getDbMock,
  getSessionFnMock,
  runInAuditContextMock,
  resolveActiveLocationAccessMock,
  buildChecklistEvidenceKeyMock,
  generatePresignedUploadUrlMock,
  generatePresignedDownloadUrlMock,
  assertUploadedObjectMock,
  attachEvidenceMock,
  assertEvidenceFileScanCleanMock,
  isMockUploadsEnabledMock,
  recordEvidenceFileScanPendingMock,
  dispatchAttachmentScanRequestMock,
  requireAttachmentsBucketNameMock,
  getEffectiveAttachmentsBucketNameMock,
  runSeedMock,
  assignChecklistTemplateToLocationsMock,
  createIncidentMock,
} = vi.hoisted(() => ({
  getDbMock: vi.fn(),
  getSessionFnMock: vi.fn(),
  runInAuditContextMock: vi.fn(async (_actorId: string, fn: () => Promise<unknown>) => fn()),
  resolveActiveLocationAccessMock: vi.fn(),
  buildChecklistEvidenceKeyMock: vi.fn(),
  generatePresignedUploadUrlMock: vi.fn(),
  generatePresignedDownloadUrlMock: vi.fn(),
  assertUploadedObjectMock: vi.fn(),
  attachEvidenceMock: vi.fn(),
  assertEvidenceFileScanCleanMock: vi.fn(),
  isMockUploadsEnabledMock: vi.fn(),
  recordEvidenceFileScanPendingMock: vi.fn(),
  dispatchAttachmentScanRequestMock: vi.fn(),
  requireAttachmentsBucketNameMock: vi.fn(() => {
    const bucket = process.env.ATTACHMENTS_BUCKET_NAME ?? process.env.ATTACHMENTS_BUCKET_NAME

    if (!bucket) {
      throw new Error('Attachment storage is not configured')
    }

    return bucket
  }),
  getEffectiveAttachmentsBucketNameMock: vi.fn(
    () =>
      process.env.ATTACHMENTS_BUCKET_NAME ??
      process.env.ATTACHMENTS_BUCKET_NAME ??
      (isMockUploadsEnabledMock() ? 'mock-bucket' : null),
  ),
  runSeedMock: vi.fn(),
  assignChecklistTemplateToLocationsMock: vi.fn(),
  createIncidentMock: vi.fn(),
}))
const checklistItem = {
  id: 'item-1',
  checklistId: 'checklist-1',
  tenantId: 'org-1',
  locationId: 'location-1',
  title: 'Review active user accounts and access levels',
  description: null,
  hipaaReference: '§164.308(a)(4)',
  status: 'pending',
  completedAt: null,
  completedBy: null,
  evidence: null as string | null,
  createdAt: new Date(),
  updatedAt: new Date(),
}

let complianceModulePromise: Promise<typeof import('./compliance.js')>

vi.mock('@phiguard/db/server', async () => {
  const actual = await vi.importActual<typeof import('@phiguard/db/server')>('@phiguard/db/server')
  return {
    ...actual,
    getDb: getDbMock,
  }
})

vi.mock('@tanstack/react-start', () => ({
  createServerFn: vi.fn(() => ({
    inputValidator: vi.fn().mockReturnThis(),
    handler: vi.fn((fn) => fn),
  })),
}))

vi.mock('../lib/attachment-scan.js', () => ({
  dispatchAttachmentScanRequest: dispatchAttachmentScanRequestMock,
}))

vi.mock('../lib/evidence-file-scan.js', () => ({
  assertEvidenceFileScanClean: assertEvidenceFileScanCleanMock,
  recordEvidenceFileScanPending: recordEvidenceFileScanPendingMock,
}))

vi.mock('@phiguard/compliance', async () => {
  const actual =
    await vi.importActual<typeof import('@phiguard/compliance')>('@phiguard/compliance')
  return {
    ...actual,
    attachEvidence: attachEvidenceMock,
    assignChecklistTemplateToLocations: assignChecklistTemplateToLocationsMock,
    createIncident: createIncidentMock,
    runSeed: runSeedMock,
  }
})

vi.mock('../lib/session.js', () => ({
  getSessionFn: getSessionFnMock,
}))

vi.mock('../lib/audit.server.js', () => ({
  runInAuditContext: runInAuditContextMock,
}))

vi.mock('./access.js', () => ({
  assertCommercialProductAccess: vi.fn(),
  canManageOrganization: vi.fn(
    (access) => access.role === 'org_owner' || access.role === 'org_admin',
  ),
  canWriteLocations: vi.fn((access) => access.role !== 'auditor'),
  resolveActiveLocationAccess: resolveActiveLocationAccessMock,
  getReadLocationIds: vi.fn((access, requestedLocationId) =>
    requestedLocationId ? [requestedLocationId] : access.allowedLocationIds,
  ),
  getWriteLocationId: vi.fn((access, requestedLocationId) => {
    if (access.role === 'auditor') {
      throw new Error('Location not found or access denied')
    }

    if (requestedLocationId) {
      return requestedLocationId
    }

    if (access.allowedLocationIds.length === 1) {
      return access.allowedLocationIds[0]
    }

    throw new Error('Location is required')
  }),
}))

vi.mock('../lib/s3.js', () => ({
  assertUploadedObject: assertUploadedObjectMock,
  buildChecklistEvidenceKey: buildChecklistEvidenceKeyMock,
  buildMockUploadUrl: vi.fn((key: string) => `/api/uploads/mock?key=${encodeURIComponent(key)}`),
  getEffectiveAttachmentsBucketName: getEffectiveAttachmentsBucketNameMock,
  generatePresignedDownloadUrl: generatePresignedDownloadUrlMock,
  generatePresignedUploadUrl: generatePresignedUploadUrlMock,
  isMockUploadsEnabled: isMockUploadsEnabledMock,
  requireAttachmentsBucketName: requireAttachmentsBucketNameMock,
  MAX_UPLOAD_BYTES: 25 * 1024 * 1024,
}))

describe('compliance evidence upload server functions', () => {
  beforeAll(async () => {
    complianceModulePromise = import('./compliance.js')
    await complianceModulePromise
  }, 30_000)

  beforeEach(() => {
    vi.clearAllMocks()

    getSessionFnMock.mockResolvedValue(makeSession('user-1', 'org-1'))
    resolveActiveLocationAccessMock.mockResolvedValue({
      userId: 'user-1',
      organizationId: 'org-1',
      role: 'org_admin',
      accessLevel: 'organization',
      allowedLocationIds: ['location-1'],
      locations: [{ id: 'location-1', name: 'Main Clinic' }],
      defaultLocationId: 'location-1',
      canAccessAllLocations: true,
    })
    buildChecklistEvidenceKeyMock.mockReturnValue(
      'evidence/org-1/checklist-items/item-1/mock_evidence.txt',
    )
    attachEvidenceMock.mockResolvedValue({
      ...checklistItem,
      evidence: 'evidence/org-1/checklist-items/item-1/mock_evidence.txt',
    })
    getDbMock.mockReturnValue(makeChecklistDb(checklistItem))
    delete process.env.ATTACHMENTS_BUCKET_NAME
    isMockUploadsEnabledMock.mockReturnValue(false)
    runSeedMock.mockResolvedValue(undefined)
    createIncidentMock.mockResolvedValue({ id: 'incident-1' })
    assignChecklistTemplateToLocationsMock.mockResolvedValue([
      {
        id: 'checklist-1',
        tenantId: 'org-1',
        locationId: 'location-1',
      },
    ])
  })

  it('rejects presign requests when attachment storage is not configured', async () => {
    const { presignChecklistEvidenceUploadFn } = await complianceModulePromise

    await expect(
      presignChecklistEvidenceUploadFn({
        data: {
          itemId: 'item-1',
          filename: 'evidence.txt',
          contentType: 'text/plain',
          sizeBytes: 128,
        },
      }),
    ).rejects.toThrow('Attachment storage is not configured')

    expect(buildChecklistEvidenceKeyMock).toHaveBeenCalledWith('org-1', 'item-1', 'evidence.txt')
    expect(generatePresignedUploadUrlMock).not.toHaveBeenCalled()
  })

  it('exposes write and admin capability flags from compliance scope', async () => {
    const { buildComplianceScope } = await complianceModulePromise

    expect(
      buildComplianceScope({
        userId: 'user-1',
        organizationId: 'org-1',
        role: 'org_admin',
        accessLevel: 'organization',
        allowedLocationIds: ['location-1'],
        locations: [{ id: 'location-1', name: 'Main Clinic' }],
        defaultLocationId: 'location-1',
        canAccessAllLocations: true,
      } as never),
    ).toMatchObject({
      canWrite: true,
      canAdmin: true,
    })
  })

  it('returns a real presigned upload URL when attachment storage is configured', async () => {
    process.env.ATTACHMENTS_BUCKET_NAME = 'attachments-bucket'
    generatePresignedUploadUrlMock.mockResolvedValue('https://signed-upload.example')
    const { presignChecklistEvidenceUploadFn } = await complianceModulePromise

    await presignChecklistEvidenceUploadFn({
      data: {
        itemId: 'item-1',
        filename: 'evidence.txt',
        contentType: 'text/plain',
        sizeBytes: 128,
      },
    })

    expect(generatePresignedUploadUrlMock).toHaveBeenCalledWith({
      bucket: 'attachments-bucket',
      key: 'evidence/org-1/checklist-items/item-1/mock_evidence.txt',
      organizationId: 'org-1',
      contentType: 'text/plain',
      sizeBytes: 128,
      expiresIn: 300,
    })
  })

  it('persists the evidence key after upload completion', async () => {
    process.env.ATTACHMENTS_BUCKET_NAME = 'attachments-bucket'
    const { completeChecklistEvidenceUploadFn } = await complianceModulePromise

    await completeChecklistEvidenceUploadFn({
      data: {
        itemId: 'item-1',
        s3Key: 'evidence/org-1/checklist-items/item-1/mock_evidence.txt',
        contentType: 'text/plain',
        sizeBytes: 128,
      },
    })

    expect(attachEvidenceMock).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        itemId: 'item-1',
        tenantId: 'org-1',
        actorId: 'user-1',
        evidence: 'storage://attachments-bucket/evidence/org-1/checklist-items/item-1/mock_evidence.txt',
      }),
    )
    expect(assertUploadedObjectMock).toHaveBeenCalledWith({
      bucket: 'attachments-bucket',
      key: 'evidence/org-1/checklist-items/item-1/mock_evidence.txt',
      contentType: 'text/plain',
      sizeBytes: 128,
    })
  })

  it('rejects evidence keys outside the item prefix', async () => {
    process.env.ATTACHMENTS_BUCKET_NAME = 'attachments-bucket'
    const { completeChecklistEvidenceUploadFn } = await complianceModulePromise

    await expect(
      completeChecklistEvidenceUploadFn({
        data: {
          itemId: 'item-1',
          s3Key: 'evidence/org-1/checklist-items/other-item/mock_evidence.txt',
          contentType: 'text/plain',
          sizeBytes: 128,
        },
      }),
    ).rejects.toThrow('Invalid evidence key')

    expect(attachEvidenceMock).not.toHaveBeenCalled()
  })

  it('rejects completion when attachment storage is not configured', async () => {
    const { completeChecklistEvidenceUploadFn } = await complianceModulePromise

    await expect(
      completeChecklistEvidenceUploadFn({
        data: {
          itemId: 'item-1',
          s3Key: 'evidence/org-1/checklist-items/item-1/mock_evidence.txt',
          contentType: 'text/plain',
          sizeBytes: 128,
        },
      }),
    ).rejects.toThrow('Attachment storage is not configured')

    expect(assertUploadedObjectMock).not.toHaveBeenCalled()
    expect(attachEvidenceMock).not.toHaveBeenCalled()
  })

  it('persists evidence in mock upload mode without attachment storage', async () => {
    isMockUploadsEnabledMock.mockReturnValue(true)
    const { completeChecklistEvidenceUploadFn } = await complianceModulePromise

    await completeChecklistEvidenceUploadFn({
      data: {
        itemId: 'item-1',
        s3Key: 'evidence/org-1/checklist-items/item-1/mock_evidence.txt',
        contentType: 'text/plain',
        sizeBytes: 128,
      },
    })

    expect(assertUploadedObjectMock).not.toHaveBeenCalled()
    expect(attachEvidenceMock).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        itemId: 'item-1',
        tenantId: 'org-1',
        actorId: 'user-1',
        evidence: 'storage://mock-bucket/evidence/org-1/checklist-items/item-1/mock_evidence.txt',
      }),
    )
  })

  it('downloads checklist evidence for a scoped readable item', async () => {
    const itemId = '11111111-1111-4111-8111-111111111111'
    process.env.ATTACHMENTS_BUCKET_NAME = 'attachments-bucket'
    generatePresignedDownloadUrlMock.mockImplementation(
      async () => 'https://signed-download.example',
    )
    getDbMock.mockReturnValue(
      makeChecklistDb({
        ...checklistItem,
        id: itemId,
        evidence: `storage://attachments-bucket/evidence/org-1/checklist-items/${itemId}/mock_evidence.txt`,
      }),
    )

    const { downloadChecklistEvidenceFn } = await complianceModulePromise

    const result = await downloadChecklistEvidenceFn({ data: { itemId } })

    expect(generatePresignedDownloadUrlMock).toHaveBeenCalledWith({
      bucket: 'attachments-bucket',
      key: `evidence/org-1/checklist-items/${itemId}/mock_evidence.txt`,
      organizationId: 'org-1',
      expiresIn: 900,
    })
    expect(result).toEqual({ downloadUrl: 'https://signed-download.example' })
  })

  it('downloads mock checklist evidence without configured attachment storage', async () => {
    const itemId = '11111111-1111-4111-8111-111111111111'
    isMockUploadsEnabledMock.mockReturnValue(true)
    getEffectiveAttachmentsBucketNameMock.mockReturnValue('mock-bucket')
    getDbMock.mockReturnValue(
      makeChecklistDb({
        ...checklistItem,
        id: itemId,
        evidence: `storage://mock-bucket/evidence/org-1/checklist-items/${itemId}/mock_evidence.txt`,
      }),
    )

    const { downloadChecklistEvidenceFn } = await complianceModulePromise

    const result = await downloadChecklistEvidenceFn({ data: { itemId } })

    expect(result).toEqual({
      downloadUrl:
        '/api/uploads/mock?key=evidence%2Forg-1%2Fchecklist-items%2F11111111-1111-4111-8111-111111111111%2Fmock_evidence.txt',
    })
    expect(requireAttachmentsBucketNameMock).not.toHaveBeenCalled()
    expect(assertEvidenceFileScanCleanMock).not.toHaveBeenCalled()
    expect(generatePresignedDownloadUrlMock).not.toHaveBeenCalled()
  })

  it('downloads checklist evidence for read-only scoped users', async () => {
    const itemId = '11111111-1111-4111-8111-111111111111'
    process.env.ATTACHMENTS_BUCKET_NAME = 'attachments-bucket'
    resolveActiveLocationAccessMock.mockResolvedValue({
      userId: 'user-1',
      organizationId: 'org-1',
      role: 'auditor',
      accessLevel: 'location',
      allowedLocationIds: ['location-1'],
      locations: [{ id: 'location-1', name: 'Main Clinic' }],
      defaultLocationId: 'location-1',
      canAccessAllLocations: false,
    })
    generatePresignedDownloadUrlMock.mockResolvedValue('https://signed-download.example')
    getDbMock.mockReturnValue(
      makeChecklistDb({
        ...checklistItem,
        id: itemId,
        locationId: 'location-1',
        evidence: `storage://attachments-bucket/evidence/org-1/checklist-items/${itemId}/mock_evidence.txt`,
      }),
    )

    const { downloadChecklistEvidenceFn } = await complianceModulePromise

    const result = await downloadChecklistEvidenceFn({ data: { itemId } })

    expect(result).toEqual({ downloadUrl: 'https://signed-download.example' })
  })

  it('rejects checklist evidence downloads when no evidence is attached', async () => {
    process.env.ATTACHMENTS_BUCKET_NAME = 'attachments-bucket'
    const { downloadChecklistEvidence } = await complianceModulePromise

    await expect(downloadChecklistEvidence('item-1')).rejects.toThrow(
      'Checklist evidence not found',
    )

    expect(generatePresignedDownloadUrlMock).not.toHaveBeenCalled()
  })

  it('rejects checklist evidence downloads when stored evidence is not an storage URI', async () => {
    process.env.ATTACHMENTS_BUCKET_NAME = 'attachments-bucket'
    getDbMock.mockReturnValue(
      makeChecklistDb({
        ...checklistItem,
        evidence: 'evidence/org-1/checklist-items/item-1/mock_evidence.txt',
      }),
    )

    const { downloadChecklistEvidence } = await complianceModulePromise

    await expect(downloadChecklistEvidence('item-1')).rejects.toThrow('Invalid evidence key')

    expect(generatePresignedDownloadUrlMock).not.toHaveBeenCalled()
  })

  it('rejects checklist evidence downloads when stored storage URI is malformed', async () => {
    process.env.ATTACHMENTS_BUCKET_NAME = 'attachments-bucket'
    getDbMock.mockReturnValue(
      makeChecklistDb({
        ...checklistItem,
        evidence: 'storage://attachments-bucket/',
      }),
    )

    const { downloadChecklistEvidence } = await complianceModulePromise

    await expect(downloadChecklistEvidence('item-1')).rejects.toThrow('Invalid evidence key')

    expect(generatePresignedDownloadUrlMock).not.toHaveBeenCalled()
  })

  it('rejects checklist evidence downloads for keys outside the item prefix', async () => {
    process.env.ATTACHMENTS_BUCKET_NAME = 'attachments-bucket'
    getDbMock.mockReturnValue(
      makeChecklistDb({
        ...checklistItem,
        evidence:
          'storage://attachments-bucket/evidence/org-1/checklist-items/other-item/mock_evidence.txt',
      }),
    )

    const { downloadChecklistEvidence } = await complianceModulePromise

    await expect(downloadChecklistEvidence('item-1')).rejects.toThrow('Invalid evidence key')

    expect(generatePresignedDownloadUrlMock).not.toHaveBeenCalled()
  })

  it('rejects checklist evidence downloads stored in a different bucket', async () => {
    process.env.ATTACHMENTS_BUCKET_NAME = 'attachments-bucket'
    getDbMock.mockReturnValue(
      makeChecklistDb({
        ...checklistItem,
        evidence: 'storage://other-bucket/evidence/org-1/checklist-items/item-1/mock_evidence.txt',
      }),
    )

    const { downloadChecklistEvidence } = await complianceModulePromise

    await expect(downloadChecklistEvidence('item-1')).rejects.toThrow('Invalid evidence bucket')

    expect(generatePresignedDownloadUrlMock).not.toHaveBeenCalled()
  })
})

describe('compliance incident server functions', () => {
  beforeAll(async () => {
    complianceModulePromise = import('./compliance.js')
    await complianceModulePromise
  }, 30_000)

  beforeEach(() => {
    vi.clearAllMocks()

    getSessionFnMock.mockResolvedValue(makeSession('user-1', 'org-1'))
    resolveActiveLocationAccessMock.mockResolvedValue({
      userId: 'user-1',
      organizationId: 'org-1',
      role: 'org_admin',
      accessLevel: 'organization',
      allowedLocationIds: ['11111111-1111-4111-8111-111111111111'],
      locations: [{ id: '11111111-1111-4111-8111-111111111111', name: 'Main Clinic' }],
      defaultLocationId: '11111111-1111-4111-8111-111111111111',
      canAccessAllLocations: true,
    })
    getDbMock.mockReturnValue(makeIncidentDb({ discovererIsMember: true }))
    createIncidentMock.mockResolvedValue({ id: 'incident-1' })
  })

  it('creates incidents when the discoverer belongs to the active organization', async () => {
    const { createIncidentFn } = await complianceModulePromise

    await createIncidentFn({
      data: {
        title: 'Lost device',
        severity: 'high',
        category: 'lost_device',
        discoveredAt: '2026-05-01T12:00:00.000Z',
        discoveredBy: '22222222-2222-4222-8222-222222222222',
        locationId: '11111111-1111-4111-8111-111111111111',
      },
    })

    expect(createIncidentMock).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        tenantId: 'org-1',
        discoveredBy: '22222222-2222-4222-8222-222222222222',
      }),
    )
  })

  it('rejects incident discoverers outside the active organization', async () => {
    getDbMock.mockReturnValue(makeIncidentDb({ discovererIsMember: false }))
    const { createIncidentFn } = await complianceModulePromise

    await expect(
      createIncidentFn({
        data: {
          title: 'Lost device',
          severity: 'high',
          category: 'lost_device',
          discoveredAt: '2026-05-01T12:00:00.000Z',
          discoveredBy: '33333333-3333-4333-8333-333333333333',
          locationId: '11111111-1111-4111-8111-111111111111',
        },
      }),
    ).rejects.toThrow('Incident discoverer must belong to this organization')

    expect(createIncidentMock).not.toHaveBeenCalled()
  })
})

describe('compliance checklist template assignment', () => {
  const assignmentLocationId = '11111111-1111-4111-8111-111111111111'

  beforeAll(async () => {
    complianceModulePromise = import('./compliance.js')
    await complianceModulePromise
  }, 30_000)

  beforeEach(() => {
    vi.clearAllMocks()

    getSessionFnMock.mockResolvedValue(makeSession('user-1', 'org-1'))
    resolveActiveLocationAccessMock.mockResolvedValue({
      userId: 'user-1',
      organizationId: 'org-1',
      role: 'org_admin',
      accessLevel: 'organization',
      allowedLocationIds: [assignmentLocationId],
      locations: [{ id: assignmentLocationId, name: 'Main Clinic' }],
      defaultLocationId: assignmentLocationId,
      canAccessAllLocations: true,
    })
    getDbMock.mockReturnValue(makeChecklistDb(checklistItem))
    runSeedMock.mockResolvedValue(undefined)
    assignChecklistTemplateToLocationsMock.mockResolvedValue([
      {
        id: 'checklist-1',
        tenantId: 'org-1',
        locationId: 'location-1',
      },
    ])
  })

  it('accepts seeded starter template ids when assigning checklists', async () => {
    const { assignChecklistTemplateFn } = await complianceModulePromise
    const starterTemplateId = STARTER_TEMPLATES[0]?.id

    expect(starterTemplateId).toBeTruthy()

    await expect(
      assignChecklistTemplateFn({
        data: {
          templateId: starterTemplateId!,
          locationIds: [assignmentLocationId],
        },
      }),
    ).resolves.not.toThrow()

    expect(runSeedMock).toHaveBeenCalled()
    expect(assignChecklistTemplateToLocationsMock).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        tenantId: 'org-1',
        templateId: starterTemplateId,
        locationIds: [assignmentLocationId],
        actorId: 'user-1',
      }),
    )
  })

  it('rejects invalid checklist template ids before persistence', async () => {
    const { assignChecklistTemplateFn } = await complianceModulePromise

    await expect(
      assignChecklistTemplateFn({
        data: {
          templateId: 'starter-template',
          locationIds: [assignmentLocationId],
        },
      }),
    ).rejects.toThrow()

    expect(runSeedMock).not.toHaveBeenCalled()
    expect(assignChecklistTemplateToLocationsMock).not.toHaveBeenCalled()
  })

  it('rejects checklist assignment for read-only auditors', async () => {
    resolveActiveLocationAccessMock.mockResolvedValue({
      userId: 'user-1',
      organizationId: 'org-1',
      role: 'auditor',
      accessLevel: 'organization',
      allowedLocationIds: [assignmentLocationId],
      locations: [{ id: assignmentLocationId, name: 'Main Clinic' }],
      defaultLocationId: assignmentLocationId,
      canAccessAllLocations: true,
    })

    const { assignChecklistTemplateFn } = await complianceModulePromise
    const starterTemplateId = STARTER_TEMPLATES[0]?.id

    await expect(
      assignChecklistTemplateFn({
        data: {
          templateId: starterTemplateId!,
          locationIds: [assignmentLocationId],
        },
      }),
    ).rejects.toThrow('Only organization administrators can manage cross-location compliance')

    expect(assignChecklistTemplateToLocationsMock).not.toHaveBeenCalled()
  })
})

function makeChecklistDb(item: typeof checklistItem) {
  const selectChain = {
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockResolvedValue([item]),
  }

  return {
    select: vi.fn().mockReturnValue(selectChain),
  }
}

function makeIncidentDb(input: { discovererIsMember: boolean }) {
  return {
    select: vi.fn(() => ({
      from: vi.fn((table: unknown) => ({
        where: vi.fn(() => ({
          limit: vi
            .fn()
            .mockResolvedValue(
              table === memberships && input.discovererIsMember ? [{ id: 'membership-1' }] : [],
            ),
        })),
      })),
    })),
  }
}

function makeSession(userId: string, organizationId: string): AppSession {
  return {
    user: {
      id: userId,
      email: 'user@example.com',
      name: 'Test User',
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    session: {
      id: 'session-id',
      token: 'session-token',
      userId,
      expiresAt: new Date(Date.now() + 60_000),
      createdAt: new Date(),
      updatedAt: new Date(),
      activeOrganizationId: organizationId,
    },
  } as AppSession
}
