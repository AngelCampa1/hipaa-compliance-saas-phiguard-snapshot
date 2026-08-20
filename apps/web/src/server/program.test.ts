import { inspect } from 'node:util'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import type { AppSession } from '../lib/session.js'

const {
  getDbMock,
  getSessionFnMock,
  runInAuditContextMock,
  resolveActiveLocationAccessMock,
  requireFeatureMock,
  requireFeatureForOrgMock,
  recordFeatureUsageMock,
  canWriteLocationsMock,
  buildTrainingCertificateKeyMock,
  buildVendorBaaEvidenceKeyMock,
  generatePresignedDownloadUrlMock,
  generatePresignedUploadUrlMock,
  getEffectiveAttachmentsBucketNameMock,
  assertEvidenceFileScanCleanMock,
  recordEvidenceFileScanPendingMock,
  dispatchAttachmentScanRequestMock,
  assertObjectExistsMock,
  isMockUploadsEnabledMock,
  requireAttachmentsBucketNameMock,
  createTaskMock,
} = vi.hoisted(() => ({
  getDbMock: vi.fn(),
  getSessionFnMock: vi.fn(),
  runInAuditContextMock: vi.fn(async (_actorId: string, fn: () => Promise<unknown>) => fn()),
  resolveActiveLocationAccessMock: vi.fn(),
  requireFeatureMock: vi.fn(),
  requireFeatureForOrgMock: vi.fn(),
  recordFeatureUsageMock: vi.fn().mockResolvedValue(undefined),
  canWriteLocationsMock: vi.fn((access: TestAccess) => access.role !== 'auditor'),
  buildTrainingCertificateKeyMock: vi.fn(),
  buildVendorBaaEvidenceKeyMock: vi.fn(),
  generatePresignedDownloadUrlMock: vi.fn(),
  generatePresignedUploadUrlMock: vi.fn(),
  getEffectiveAttachmentsBucketNameMock: vi.fn(() => 'attachments-bucket'),
  assertEvidenceFileScanCleanMock: vi.fn(),
  recordEvidenceFileScanPendingMock: vi.fn(),
  dispatchAttachmentScanRequestMock: vi.fn(),
  assertObjectExistsMock: vi.fn(),
  isMockUploadsEnabledMock: vi.fn(),
  requireAttachmentsBucketNameMock: vi.fn(),
  createTaskMock: vi.fn().mockResolvedValue({ id: 'task-1' }),
}))

const policy = {
  id: '11111111-1111-4111-8111-111111111111',
  tenantId: 'org-1',
  title: 'Access Policy',
  bodyMarkdown: 'Policy body',
  status: 'published',
  version: 1,
  requiresAcknowledgement: true,
  effectiveDate: null,
  createdAt: new Date(),
  updatedAt: new Date(),
}

let programModulePromise: Promise<typeof import('./program.js')>
type TestAccess = {
  role: 'auditor' | 'location_staff' | 'org_admin' | 'org_owner'
}

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

vi.mock('@phiguard/billing', () => ({
  requireFeature: requireFeatureMock,
  requireFeatureForOrg: requireFeatureForOrgMock,
  recordFeatureUsage: recordFeatureUsageMock,
}))

vi.mock('@phiguard/db/tasks', () => ({
  createTask: createTaskMock,
}))

vi.mock('../lib/attachment-scan.js', () => ({
  dispatchAttachmentScanRequest: dispatchAttachmentScanRequestMock,
}))

vi.mock('../lib/evidence-file-scan.js', () => ({
  assertEvidenceFileScanClean: assertEvidenceFileScanCleanMock,
  recordEvidenceFileScanPending: recordEvidenceFileScanPendingMock,
}))

vi.mock('../lib/session.js', () => ({
  getSessionFn: getSessionFnMock,
}))

vi.mock('../lib/audit.server.js', () => ({
  runInAuditContext: runInAuditContextMock,
}))

vi.mock('../lib/s3.js', () => ({
  ALLOWED_UPLOAD_CONTENT_TYPES: new Set(['application/pdf', 'text/plain']),
  MAX_UPLOAD_BYTES: 25 * 1024 * 1024,
  assertObjectExists: assertObjectExistsMock,
  buildMockUploadUrl: vi.fn((key: string) => `/api/uploads/mock?key=${encodeURIComponent(key)}`),
  buildTrainingCertificateKey: buildTrainingCertificateKeyMock,
  buildVendorBaaEvidenceKey: buildVendorBaaEvidenceKeyMock,
  generatePresignedDownloadUrl: generatePresignedDownloadUrlMock,
  generatePresignedUploadUrl: generatePresignedUploadUrlMock,
  getEffectiveAttachmentsBucketName: getEffectiveAttachmentsBucketNameMock,
  isMockUploadsEnabled: isMockUploadsEnabledMock,
  requireAttachmentsBucketName: requireAttachmentsBucketNameMock,
}))

vi.mock('./access.js', () => ({
  assertCommercialProductAccess: vi.fn((access: { commercial?: { planStatus: string } | null }) => {
    if (access.commercial?.planStatus === 'trial_pending') {
      throw new Error('Start the trial before accessing PHIGuard.')
    }
  }),
  canManageOrganization: vi.fn(
    (access: TestAccess) => access.role === 'org_owner' || access.role === 'org_admin',
  ),
  canWriteLocations: canWriteLocationsMock,
  resolveActiveLocationAccess: resolveActiveLocationAccessMock,
}))

describe('program policy detail access flags', () => {
  beforeAll(async () => {
    programModulePromise = import('./program.js')
    await programModulePromise
  }, 30_000)

  beforeEach(() => {
    vi.clearAllMocks()

    getSessionFnMock.mockResolvedValue(makeSession('user-1', 'org-1'))
    requireFeatureMock.mockImplementation(() => undefined)
    requireFeatureForOrgMock.mockImplementation(() => undefined)
    recordFeatureUsageMock.mockResolvedValue(undefined)
    getDbMock.mockReturnValue(makeProgramDb([[{ plan: 'group' }], [policy], []]))
  })

  it('marks the detail loader read-only for auditors', async () => {
    resolveActiveLocationAccessMock.mockResolvedValue(makeAccess('auditor'))

    const { getProgramPolicyFn } = await programModulePromise

    await expect(
      getProgramPolicyFn({
        data: {
          policyId: policy.id,
        },
      }),
    ).resolves.toMatchObject({
      policy,
      hasAcknowledged: false,
      canAcknowledge: false,
    })
  })

  it('allows the detail loader to expose the acknowledgement action for write-capable users', async () => {
    resolveActiveLocationAccessMock.mockResolvedValue(makeAccess('location_staff'))

    const { getProgramPolicyFn } = await programModulePromise

    await expect(
      getProgramPolicyFn({
        data: {
          policyId: policy.id,
        },
      }),
    ).resolves.toMatchObject({
      policy,
      hasAcknowledged: false,
      canAcknowledge: true,
    })
  })

  it('blocks program access before the trial is started', async () => {
    resolveActiveLocationAccessMock.mockResolvedValue(
      makeAccess('org_admin', {
        commercial: {
          plan: 'group',
          planStatus: 'trial_pending',
          trialStartedAt: null,
          trialEndsAt: null,
          stripeCustomerId: null,
          stripeSubscriptionId: null,
        },
      }),
    )

    const { getProgramPolicyFn } = await programModulePromise

    await expect(
      getProgramPolicyFn({
        data: {
          policyId: policy.id,
        },
      }),
    ).rejects.toThrow('Start the trial before accessing PHIGuard.')
  })

  it('creates draft policies for administrators', async () => {
    resolveActiveLocationAccessMock.mockResolvedValue(makeAccess('org_admin'))
    const db = makeProgramPolicyCreateDb()
    getDbMock.mockReturnValue(db)

    const { createProgramPolicyFn } = await programModulePromise

    await expect(
      createProgramPolicyFn({
        data: {
          title: 'Sanctions Policy',
          bodyMarkdown: 'Policy body',
          version: '1.0',
          effectiveDate: '2026-06-01',
          requiresAcknowledgement: true,
        },
      }),
    ).resolves.toMatchObject({
      id: 'policy-created',
      tenantId: 'org-1',
      title: 'Sanctions Policy',
      bodyMarkdown: 'Policy body',
      version: '1.0',
      status: 'draft',
      requiresAcknowledgement: true,
    })

    expect(db.insertValues).toHaveBeenCalledWith({
      tenantId: 'org-1',
      title: 'Sanctions Policy',
      bodyMarkdown: 'Policy body',
      version: '1.0',
      effectiveDate: new Date('2026-06-01T00:00:00.000Z'),
      requiresAcknowledgement: true,
      status: 'draft',
    })
  })

  it('updates draft policies for administrators', async () => {
    resolveActiveLocationAccessMock.mockResolvedValue(makeAccess('org_admin'))
    const db = makeProgramPolicyUpdateDb()
    getDbMock.mockReturnValue(db)

    const { updateProgramPolicyDraftFn } = await programModulePromise

    await updateProgramPolicyDraftFn({
      data: {
        policyId: policy.id,
        title: 'Updated Policy',
        bodyMarkdown: 'Updated body',
        version: '2.0',
        requiresAcknowledgement: false,
      },
    })

    expect(db.updateSet).toHaveBeenCalledWith({
      title: 'Updated Policy',
      bodyMarkdown: 'Updated body',
      version: '2.0',
      effectiveDate: undefined,
      requiresAcknowledgement: false,
    })
  })

  it('blocks policy creation for non-admin users', async () => {
    resolveActiveLocationAccessMock.mockResolvedValue(makeAccess('location_staff'))
    getDbMock.mockReturnValue(
      makeProgramDb([[{ plan: 'group', planStatus: 'active', trialEndsAt: null }]]),
    )

    const { createProgramPolicyFn } = await programModulePromise

    await expect(
      createProgramPolicyFn({
        data: {
          title: 'Sanctions Policy',
          bodyMarkdown: 'Policy body',
          version: '1.0',
          requiresAcknowledgement: true,
        },
      }),
    ).rejects.toThrow('Only administrators can manage policies')
  })

  it('hides draft policies from non-admin policy lists', async () => {
    resolveActiveLocationAccessMock.mockResolvedValue(makeAccess('location_staff'))
    const publishedPolicy = {
      ...policy,
      id: '22222222-2222-4222-8222-222222222222',
      title: 'Published Policy',
      status: 'published',
    }
    const draftPolicy = {
      ...policy,
      id: '33333333-3333-4333-8333-333333333333',
      title: 'Draft Policy',
      status: 'draft',
    }
    getDbMock.mockReturnValue(
      makeProgramDb([
        [{ plan: 'group', planStatus: 'active', trialEndsAt: null }],
        [publishedPolicy, draftPolicy],
        [{ id: 'membership-1' }],
        [],
        [],
      ]),
    )

    const { listProgramPoliciesFn } = await programModulePromise

    await expect(listProgramPoliciesFn()).resolves.toMatchObject({
      canAdmin: false,
      policies: [
        {
          id: publishedPolicy.id,
          title: 'Published Policy',
        },
      ],
    })
  })

  it('blocks non-admin access to draft policy detail', async () => {
    resolveActiveLocationAccessMock.mockResolvedValue(makeAccess('location_staff'))
    getDbMock.mockReturnValue(
      makeProgramDb([
        [{ plan: 'group', planStatus: 'active', trialEndsAt: null }],
        [{ ...policy, status: 'draft' }],
      ]),
    )

    const { getProgramPolicyFn } = await programModulePromise

    await expect(
      getProgramPolicyFn({
        data: {
          policyId: policy.id,
        },
      }),
    ).rejects.toThrow('Policy not found')
  })

  it('blocks policy draft updates for non-admin users', async () => {
    resolveActiveLocationAccessMock.mockResolvedValue(makeAccess('location_staff'))
    getDbMock.mockReturnValue(
      makeProgramDb([[{ plan: 'group', planStatus: 'active', trialEndsAt: null }]]),
    )

    const { updateProgramPolicyDraftFn } = await programModulePromise

    await expect(
      updateProgramPolicyDraftFn({
        data: {
          policyId: policy.id,
          title: 'Updated Policy',
          bodyMarkdown: 'Updated body',
          version: '2.0',
          requiresAcknowledgement: true,
        },
      }),
    ).rejects.toThrow('Only administrators can manage policies')
  })

  it('blocks policy publishing for non-admin users', async () => {
    resolveActiveLocationAccessMock.mockResolvedValue(makeAccess('location_staff'))
    getDbMock.mockReturnValue(
      makeProgramDb([[{ plan: 'group', planStatus: 'active', trialEndsAt: null }]]),
    )

    const { publishProgramPolicyFn } = await programModulePromise

    await expect(
      publishProgramPolicyFn({
        data: {
          policyId: policy.id,
        },
      }),
    ).rejects.toThrow('Only administrators can publish policies')
  })
})

describe('program dashboard', () => {
  beforeAll(async () => {
    programModulePromise = import('./program.js')
    await programModulePromise
  }, 30_000)

  beforeEach(() => {
    vi.clearAllMocks()

    getSessionFnMock.mockResolvedValue(makeSession('user-1', 'org-1'))
    requireFeatureForOrgMock.mockImplementation(() => undefined)
    recordFeatureUsageMock.mockResolvedValue(undefined)
    resolveActiveLocationAccessMock.mockResolvedValue(makeAccess('org_admin'))
  })

  it('reports organization-wide policy acknowledgements, training, and BAA attention counts', async () => {
    const expiringBaa = {
      id: 'baa-expiring',
      vendorId: 'vendor-1',
      expiresAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    }
    const expiredBaa = {
      id: 'baa-expired',
      vendorId: 'vendor-2',
      expiresAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    }
    getDbMock.mockReturnValue(
      makeProgramDb([
        [{ plan: 'group', planStatus: 'active', trialEndsAt: null }],
        [{ count: 2 }],
        [{ id: 'policy-1' }, { id: 'policy-2' }],
        [{ userId: 'user-1' }, { userId: 'user-2' }],
        [
          { policyId: 'policy-1', userId: 'user-1' },
          { policyId: 'policy-1', userId: 'user-2' },
          { policyId: 'policy-2', userId: 'user-1' },
        ],
        [
          {
            status: 'assigned',
            dueAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
          },
          {
            status: 'assigned',
            dueAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          },
          {
            status: 'completed',
            dueAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
          },
        ],
        [],
        [expiringBaa],
        [expiredBaa],
      ]),
    )

    const { getProgramDashboardFn } = await programModulePromise

    await expect(getProgramDashboardFn()).resolves.toMatchObject({
      policies: {
        publishedCount: 2,
        pendingAckCount: 1,
      },
      training: {
        overdueCount: 1,
        dueSoonCount: 1,
      },
      vendors: {
        expiringBaaCount: 1,
        expiredBaaCount: 1,
      },
    })
  })
})

describe('program risk assessments', () => {
  beforeAll(async () => {
    programModulePromise = import('./program.js')
    await programModulePromise
  }, 30_000)

  beforeEach(() => {
    vi.clearAllMocks()

    getSessionFnMock.mockResolvedValue(makeSession('user-1', 'org-1'))
    requireFeatureForOrgMock.mockImplementation(() => undefined)
    recordFeatureUsageMock.mockResolvedValue(undefined)
    resolveActiveLocationAccessMock.mockResolvedValue(makeAccess('org_admin'))
  })

  it('lists risk item owners and assignable members for administrators', async () => {
    const db = makeProgramDb([
      [{ plan: 'group', planStatus: 'active', trialEndsAt: null }],
      [
        {
          id: 'assessment-1',
          tenantId: 'org-1',
          title: 'Annual HIPAA Risk Assessment',
          status: 'open',
        },
      ],
      [
        {
          id: 'item-1',
          assessmentId: 'assessment-1',
          category: 'Access Control',
          description: 'Privileged account review is overdue',
          likelihood: 3,
          impact: 5,
          score: 15,
          mitigation: 'Complete quarterly access review',
          ownerId: '22222222-2222-4222-8222-222222222222',
          ownerName: 'Nurse One',
          ownerEmail: 'nurse@example.com',
          dueAt: null,
          status: 'high',
          createdAt: new Date('2026-05-01T00:00:00.000Z'),
          updatedAt: new Date('2026-05-01T00:00:00.000Z'),
        },
      ],
      [
        {
          id: '22222222-2222-4222-8222-222222222222',
          name: 'Nurse One',
          email: 'nurse@example.com',
        },
      ],
    ])
    getDbMock.mockReturnValue(db)

    const { listRiskAssessmentsFn } = await programModulePromise

    await expect(listRiskAssessmentsFn()).resolves.toMatchObject({
      canAdmin: true,
      users: [
        {
          id: '22222222-2222-4222-8222-222222222222',
          name: 'Nurse One',
          email: 'nurse@example.com',
        },
      ],
      assessments: [
        {
          id: 'assessment-1',
          items: [
            {
              id: 'item-1',
              ownerId: '22222222-2222-4222-8222-222222222222',
              ownerName: 'Nurse One',
              ownerEmail: 'nurse@example.com',
            },
          ],
        },
      ],
    })
  })

  it('does not expose stale risk item owner details outside the organization', async () => {
    const db = makeProgramDb([
      [{ plan: 'group', planStatus: 'active', trialEndsAt: null }],
      [
        {
          id: 'assessment-1',
          tenantId: 'org-1',
          title: 'Annual HIPAA Risk Assessment',
          status: 'open',
        },
      ],
      [
        {
          id: 'item-1',
          assessmentId: 'assessment-1',
          category: 'Access Control',
          description: 'Privileged account review is overdue',
          likelihood: 3,
          impact: 5,
          score: 15,
          mitigation: 'Complete quarterly access review',
          ownerId: '33333333-3333-4333-8333-333333333333',
          ownerName: 'Other Org User',
          ownerEmail: 'other@example.com',
          dueAt: null,
          status: 'high',
          createdAt: new Date('2026-05-01T00:00:00.000Z'),
          updatedAt: new Date('2026-05-01T00:00:00.000Z'),
        },
      ],
      [
        {
          id: '22222222-2222-4222-8222-222222222222',
          name: 'Nurse One',
          email: 'nurse@example.com',
        },
      ],
    ])
    getDbMock.mockReturnValue(db)

    const { listRiskAssessmentsFn } = await programModulePromise

    await expect(listRiskAssessmentsFn()).resolves.toMatchObject({
      assessments: [
        {
          id: 'assessment-1',
          items: [
            {
              id: 'item-1',
              ownerId: null,
              ownerName: null,
              ownerEmail: null,
            },
          ],
        },
      ],
    })
  })

  it('shows valid risk item owners to read-only organization members without exposing assignable users', async () => {
    resolveActiveLocationAccessMock.mockResolvedValue(makeAccess('location_staff'))
    const db = makeProgramDb([
      [{ plan: 'group', planStatus: 'active', trialEndsAt: null }],
      [
        {
          id: 'assessment-1',
          tenantId: 'org-1',
          title: 'Annual HIPAA Risk Assessment',
          status: 'open',
        },
      ],
      [
        {
          id: 'item-1',
          assessmentId: 'assessment-1',
          category: 'Access Control',
          description: 'Privileged account review is overdue',
          likelihood: 3,
          impact: 5,
          score: 15,
          mitigation: 'Complete quarterly access review',
          ownerId: '22222222-2222-4222-8222-222222222222',
          dueAt: null,
          status: 'high',
          createdAt: new Date('2026-05-01T00:00:00.000Z'),
          updatedAt: new Date('2026-05-01T00:00:00.000Z'),
        },
      ],
      [
        {
          id: '22222222-2222-4222-8222-222222222222',
          name: 'Nurse One',
          email: 'nurse@example.com',
        },
      ],
    ])
    getDbMock.mockReturnValue(db)

    const { listRiskAssessmentsFn } = await programModulePromise

    await expect(listRiskAssessmentsFn()).resolves.toMatchObject({
      canAdmin: false,
      users: [],
      assessments: [
        {
          id: 'assessment-1',
          items: [
            {
              id: 'item-1',
              ownerId: '22222222-2222-4222-8222-222222222222',
              ownerName: 'Nurse One',
              ownerEmail: 'nurse@example.com',
            },
          ],
        },
      ],
    })
  })

  it('creates risk items with an organization member owner', async () => {
    const db = makeRiskItemCreateDb()
    getDbMock.mockReturnValue(db)

    const { createRiskItemFn } = await programModulePromise

    await createRiskItemFn({
      data: {
        assessmentId: '11111111-1111-4111-8111-111111111111',
        category: 'Access Control',
        description: 'Privileged account review is overdue',
        likelihood: 3,
        impact: 5,
        mitigation: 'Complete quarterly access review',
        ownerId: '22222222-2222-4222-8222-222222222222',
        dueAt: '2026-07-01',
      },
    })

    expect(db.insertValues).toHaveBeenCalledWith(
      expect.objectContaining({
        ownerId: '22222222-2222-4222-8222-222222222222',
      }),
    )
    expect(db.auditValues).toHaveBeenCalled()
  })

  it('rejects risk item owners outside the organization', async () => {
    const db = makeRiskItemCreateDb(false)
    getDbMock.mockReturnValue(db)

    const { createRiskItemFn } = await programModulePromise

    await expect(
      createRiskItemFn({
        data: {
          assessmentId: '11111111-1111-4111-8111-111111111111',
          category: 'Access Control',
          description: 'Privileged account review is overdue',
          likelihood: 3,
          impact: 5,
          ownerId: '22222222-2222-4222-8222-222222222222',
        },
      }),
    ).rejects.toThrow('Risk owner must be an organization member')

    expect(db.insertValues).not.toHaveBeenCalled()
    expect(db.auditValues).not.toHaveBeenCalled()
  })

  it('updates risk assessment status for administrators', async () => {
    const db = makeRiskAssessmentStatusDb(true)
    getDbMock.mockReturnValue(db)

    const { updateRiskAssessmentStatusFn } = await programModulePromise

    await updateRiskAssessmentStatusFn({
      data: {
        assessmentId: '11111111-1111-4111-8111-111111111111',
        status: 'in_review',
      },
    })

    expect(db.updateSet).toHaveBeenCalledWith({
      status: 'in_review',
      reviewerId: null,
      reviewedAt: null,
    })
    expect(db.auditValues).toHaveBeenCalled()
  })

  it('blocks risk assessment status updates for non-admin users', async () => {
    resolveActiveLocationAccessMock.mockResolvedValue(makeAccess('location_staff'))
    const db = makeRiskAssessmentStatusDb(true)
    getDbMock.mockReturnValue(db)

    const { updateRiskAssessmentStatusFn } = await programModulePromise

    await expect(
      updateRiskAssessmentStatusFn({
        data: {
          assessmentId: '11111111-1111-4111-8111-111111111111',
          status: 'closed',
        },
      }),
    ).rejects.toThrow('Only administrators can update risk assessments')

    expect(db.updateSet).not.toHaveBeenCalled()
    expect(db.auditValues).not.toHaveBeenCalled()
  })

  it('updates risk items for administrators', async () => {
    const db = makeRiskItemUpdateDb(true)
    getDbMock.mockReturnValue(db)

    const { updateRiskItemFn } = await programModulePromise

    await updateRiskItemFn({
      data: {
        itemId: '11111111-1111-4111-8111-111111111111',
        category: 'Access Control',
        description: 'Privileged account review is overdue',
        likelihood: 3,
        impact: 5,
        mitigation: 'Complete quarterly access review',
        ownerId: '22222222-2222-4222-8222-222222222222',
        dueAt: '2026-07-01',
      },
    })

    expect(db.updateSet).toHaveBeenCalledWith(
      expect.objectContaining({
        score: 15,
        status: 'high',
        ownerId: '22222222-2222-4222-8222-222222222222',
        dueAt: new Date('2026-07-01T00:00:00.000Z'),
      }),
    )
    expect(db.auditValues).toHaveBeenCalled()
  })

  it('clears risk item due dates when administrators remove them', async () => {
    const db = makeRiskItemUpdateDb(true, true, false)
    getDbMock.mockReturnValue(db)

    const { updateRiskItemFn } = await programModulePromise

    await updateRiskItemFn({
      data: {
        itemId: '11111111-1111-4111-8111-111111111111',
        category: 'Access Control',
        description: 'Privileged account review is overdue',
        likelihood: 3,
        impact: 5,
        mitigation: 'Complete quarterly access review',
        dueAt: null,
      },
    })

    expect(db.updateSet).toHaveBeenCalledWith(
      expect.objectContaining({
        dueAt: null,
      }),
    )
  })

  it('blocks risk item updates for non-admin users', async () => {
    resolveActiveLocationAccessMock.mockResolvedValue(makeAccess('location_staff'))
    const db = makeRiskItemUpdateDb(true)
    getDbMock.mockReturnValue(db)

    const { updateRiskItemFn } = await programModulePromise

    await expect(
      updateRiskItemFn({
        data: {
          itemId: '11111111-1111-4111-8111-111111111111',
          category: 'Access Control',
          description: 'Privileged account review is overdue',
          likelihood: 3,
          impact: 5,
        },
      }),
    ).rejects.toThrow('Only administrators can update risk items')

    expect(db.updateSet).not.toHaveBeenCalled()
    expect(db.auditValues).not.toHaveBeenCalled()
  })

  it('rejects updated risk item owners outside the organization', async () => {
    const db = makeRiskItemUpdateDb(true, false)
    getDbMock.mockReturnValue(db)

    const { updateRiskItemFn } = await programModulePromise

    await expect(
      updateRiskItemFn({
        data: {
          itemId: '11111111-1111-4111-8111-111111111111',
          category: 'Access Control',
          description: 'Privileged account review is overdue',
          likelihood: 3,
          impact: 5,
          ownerId: '22222222-2222-4222-8222-222222222222',
        },
      }),
    ).rejects.toThrow('Risk owner must be an organization member')

    expect(db.updateSet).not.toHaveBeenCalled()
    expect(db.auditValues).not.toHaveBeenCalled()
  })
})

describe('program training records', () => {
  beforeAll(async () => {
    programModulePromise = import('./program.js')
    await programModulePromise
  }, 30_000)

  beforeEach(() => {
    vi.clearAllMocks()

    getSessionFnMock.mockResolvedValue(makeSession('user-1', 'org-1'))
    requireFeatureForOrgMock.mockImplementation(() => undefined)
    recordFeatureUsageMock.mockResolvedValue(undefined)
    resolveActiveLocationAccessMock.mockResolvedValue(makeAccess('org_admin'))
    isMockUploadsEnabledMock.mockReturnValue(false)
    requireAttachmentsBucketNameMock.mockReturnValue('attachments-bucket')
    assertObjectExistsMock.mockResolvedValue({
      contentType: 'application/pdf',
      sizeBytes: 128,
    })
    buildTrainingCertificateKeyMock.mockReturnValue(
      'evidence/org-1/training-certificates/11111111-1111-4111-8111-111111111111/certificate.pdf',
    )
    generatePresignedUploadUrlMock.mockResolvedValue('https://signed-upload.example')
  })

  it('returns assignment options for administrators with training records', async () => {
    const dueAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    const createdAt = new Date('2026-05-01T12:00:00.000Z')
    const db = makeProgramDb([
      [{ plan: 'group', planStatus: 'active', trialEndsAt: null }],
      [
        {
          id: 'record-1',
          userId: 'user-2',
          userName: 'Nurse One',
          userEmail: 'nurse@example.com',
          courseId: 'course-1',
          status: 'not_started',
          completedAt: null,
          dueAt,
          certificateFileKey: null,
          createdAt,
          updatedAt: createdAt,
          courseTitle: 'HIPAA Basics',
        },
      ],
      [
        {
          id: 'course-1',
          title: 'HIPAA Basics',
          description: 'Annual HIPAA training',
          frequencyDays: 365,
        },
      ],
      [
        {
          id: 'user-2',
          name: 'Nurse One',
          email: 'nurse@example.com',
        },
      ],
    ])
    getDbMock.mockReturnValue(db)

    const { listTrainingRecordsFn } = await programModulePromise

    await expect(listTrainingRecordsFn()).resolves.toMatchObject({
      canAdmin: true,
      courses: [
        {
          id: 'course-1',
          title: 'HIPAA Basics',
          description: 'Annual HIPAA training',
          frequencyDays: 365,
        },
      ],
      users: [{ id: 'user-2', name: 'Nurse One', email: 'nurse@example.com' }],
      records: [
        {
          id: 'record-1',
          userName: 'Nurse One',
          userEmail: 'nurse@example.com',
          dueStatus: 'not_started',
        },
      ],
    })
  })

  it('keeps historical training records visible when no active courses are assignable', async () => {
    const dueAt = new Date('2026-06-01T12:00:00.000Z')
    const createdAt = new Date('2026-05-01T12:00:00.000Z')
    const db = makeProgramDb([
      [{ plan: 'group', planStatus: 'active', trialEndsAt: null }],
      [
        {
          id: 'record-1',
          userId: 'user-2',
          userName: 'Nurse One',
          userEmail: 'nurse@example.com',
          courseId: 'course-1',
          status: 'completed',
          completedAt: new Date('2026-05-15T12:00:00.000Z'),
          dueAt,
          certificateFileKey: null,
          createdAt,
          updatedAt: createdAt,
          courseTitle: 'Retired HIPAA Basics',
        },
      ],
      [],
      [
        {
          id: 'user-2',
          name: 'Nurse One',
          email: 'nurse@example.com',
        },
      ],
    ])
    getDbMock.mockReturnValue(db)

    const { listTrainingRecordsFn } = await programModulePromise

    await expect(listTrainingRecordsFn()).resolves.toMatchObject({
      canAdmin: true,
      courses: [],
      records: [
        {
          id: 'record-1',
          courseTitle: 'Retired HIPAA Basics',
          dueStatus: 'ok',
        },
      ],
    })
  })

  it('marks training certificate downloads unavailable for read-only users', async () => {
    resolveActiveLocationAccessMock.mockResolvedValue(makeAccess('auditor'))
    const db = makeProgramDb([
      [{ plan: 'group', planStatus: 'active', trialEndsAt: null }],
      [
        {
          id: 'record-1',
          userId: 'user-2',
          userName: 'Nurse One',
          userEmail: 'nurse@example.com',
          courseId: 'course-1',
          status: 'completed',
          completedAt: new Date('2026-05-15T12:00:00.000Z'),
          dueAt: new Date('2026-06-01T12:00:00.000Z'),
          certificateFileKey: 'evidence/org-1/training-certificates/record-1/certificate.pdf',
          createdAt: new Date('2026-05-01T12:00:00.000Z'),
          updatedAt: new Date('2026-05-15T12:00:00.000Z'),
          courseTitle: 'HIPAA Basics',
        },
      ],
    ])
    getDbMock.mockReturnValue(db)

    const { listTrainingRecordsFn } = await programModulePromise

    const result = await listTrainingRecordsFn()

    expect(result).toMatchObject({
      canAdmin: false,
      canDownloadCertificates: false,
      records: [
        {
          id: 'record-1',
          hasCertificateFile: true,
        },
      ],
    })
    expect(result.records[0]).not.toHaveProperty('certificateFileKey')
  })

  it('limits read-only organization training records to the current user', async () => {
    resolveActiveLocationAccessMock.mockResolvedValue(makeAccess('auditor'))
    const whereConditions: unknown[] = []
    const results = [
      [{ plan: 'group', planStatus: 'active', trialEndsAt: null }],
      [
        {
          id: 'record-1',
          userId: 'user-1',
          userName: 'Test User',
          userEmail: 'user@example.com',
          courseId: 'course-1',
          status: 'not_started',
          completedAt: null,
          dueAt: new Date('2026-06-01T12:00:00.000Z'),
          certificateFileKey: null,
          createdAt: new Date('2026-05-01T12:00:00.000Z'),
          updatedAt: new Date('2026-05-01T12:00:00.000Z'),
          courseTitle: 'HIPAA Basics',
        },
      ],
    ]
    const db = {
      select: vi.fn().mockImplementation(() => {
        const chain = {
          from: vi.fn().mockReturnThis(),
          leftJoin: vi.fn().mockReturnThis(),
          where: vi.fn((condition) => {
            whereConditions.push(condition)
            return chain
          }),
          limit: vi.fn(async () => results.shift() ?? []),
          then: (resolve: (value: unknown[]) => unknown, reject?: (reason?: unknown) => unknown) =>
            Promise.resolve(results.shift() ?? []).then(resolve, reject),
        }

        return chain
      }),
    }
    getDbMock.mockReturnValue(db)

    const { listTrainingRecordsFn } = await programModulePromise

    const result = await listTrainingRecordsFn()

    expect(result).toMatchObject({
      canAdmin: false,
      users: [],
      records: [
        {
          id: 'record-1',
          userId: 'user-1',
          userEmail: 'user@example.com',
        },
      ],
    })
    expect(inspect(whereConditions[1], { depth: 20 })).toContain('user-1')
  })

  it('creates tenant training courses for administrators', async () => {
    const db = makeTrainingCourseCreateDb()
    getDbMock.mockReturnValue(db)

    const { createTrainingCourseFn } = await programModulePromise

    await expect(
      createTrainingCourseFn({
        data: {
          title: 'HIPAA Basics',
          description: 'Annual HIPAA training',
          frequencyDays: 365,
        },
      }),
    ).resolves.toMatchObject({
      id: 'course-1',
      tenantId: 'org-1',
      title: 'HIPAA Basics',
      description: 'Annual HIPAA training',
      frequencyDays: 365,
      isActive: true,
    })

    expect(db.insertValues).toHaveBeenCalledWith({
      tenantId: 'org-1',
      title: 'HIPAA Basics',
      description: 'Annual HIPAA training',
      frequencyDays: 365,
      isActive: true,
    })
  })

  it('deactivates tenant training courses for administrators', async () => {
    const db = makeTrainingCourseDeactivateDb()
    getDbMock.mockReturnValue(db)

    const { deactivateTrainingCourseFn } = await programModulePromise

    await deactivateTrainingCourseFn({
      data: {
        courseId: '11111111-1111-4111-8111-111111111111',
      },
    })

    expect(db.updateSet).toHaveBeenCalledWith({ isActive: false })
  })

  it('blocks course management for non-admin users', async () => {
    resolveActiveLocationAccessMock.mockResolvedValue(makeAccess('location_staff'))
    getDbMock.mockReturnValue(
      makeProgramDb([[{ plan: 'group', planStatus: 'active', trialEndsAt: null }]]),
    )

    const { createTrainingCourseFn } = await programModulePromise

    await expect(
      createTrainingCourseFn({
        data: {
          title: 'HIPAA Basics',
          frequencyDays: 365,
        },
      }),
    ).rejects.toThrow('Only administrators can manage training courses')
  })

  it('presigns certificate uploads under the training record evidence prefix', async () => {
    getDbMock.mockReturnValue(
      makeProgramDb([
        [{ plan: 'group', planStatus: 'active', trialEndsAt: null }],
        [{ id: '11111111-1111-4111-8111-111111111111', userId: 'user-2' }],
        [{ id: 'membership-1' }],
      ]),
    )
    const { presignTrainingCertificateUploadFn } = await programModulePromise

    await expect(
      presignTrainingCertificateUploadFn({
        data: {
          recordId: '11111111-1111-4111-8111-111111111111',
          filename: 'certificate.pdf',
          contentType: 'application/pdf',
          sizeBytes: 1024,
        },
      }),
    ).resolves.toEqual({
      uploadUrl: 'https://signed-upload.example',
      key: 'evidence/org-1/training-certificates/11111111-1111-4111-8111-111111111111/certificate.pdf',
    })

    expect(buildTrainingCertificateKeyMock).toHaveBeenCalledWith(
      'org-1',
      '11111111-1111-4111-8111-111111111111',
      'certificate.pdf',
    )
    expect(generatePresignedUploadUrlMock).toHaveBeenCalledWith({
      bucket: 'attachments-bucket',
      key: 'evidence/org-1/training-certificates/11111111-1111-4111-8111-111111111111/certificate.pdf',
      organizationId: 'org-1',
      contentType: 'application/pdf',
      sizeBytes: 1024,
      expiresIn: 300,
    })
  })

  it("does not presign another user's training certificate for non-admin users", async () => {
    resolveActiveLocationAccessMock.mockResolvedValue(makeAccess('location_staff'))
    getDbMock.mockReturnValue(
      makeProgramDb([
        [{ plan: 'group', planStatus: 'active', trialEndsAt: null }],
        [{ id: '11111111-1111-4111-8111-111111111111', userId: 'user-2' }],
      ]),
    )
    const { presignTrainingCertificateUploadFn } = await programModulePromise

    await expect(
      presignTrainingCertificateUploadFn({
        data: {
          recordId: '11111111-1111-4111-8111-111111111111',
          filename: 'certificate.pdf',
          contentType: 'application/pdf',
          sizeBytes: 1024,
        },
      }),
    ).rejects.toThrow('Training record not found')

    expect(generatePresignedUploadUrlMock).not.toHaveBeenCalled()
  })

  it('downloads training certificate evidence for administrators', async () => {
    generatePresignedDownloadUrlMock.mockResolvedValue('https://signed-download.example')
    getDbMock.mockReturnValue(
      makeProgramDb([
        [{ plan: 'group', planStatus: 'active', trialEndsAt: null }],
        [
          {
            id: '11111111-1111-4111-8111-111111111111',
            userId: 'user-2',
            certificateFileKey:
              'evidence/org-1/training-certificates/11111111-1111-4111-8111-111111111111/certificate.pdf',
          },
        ],
        [{ id: 'membership-1' }],
      ]),
    )

    const { downloadTrainingCertificateFn } = await programModulePromise

    await expect(
      downloadTrainingCertificateFn({
        data: { recordId: '11111111-1111-4111-8111-111111111111' },
      }),
    ).resolves.toEqual({ downloadUrl: 'https://signed-download.example' })

    expect(generatePresignedDownloadUrlMock).toHaveBeenCalledWith({
      bucket: 'attachments-bucket',
      key: 'evidence/org-1/training-certificates/11111111-1111-4111-8111-111111111111/certificate.pdf',
      organizationId: 'org-1',
      expiresIn: 900,
    })
  })

  it('downloads mock training certificates without configured attachment storage', async () => {
    isMockUploadsEnabledMock.mockReturnValue(true)
    getEffectiveAttachmentsBucketNameMock.mockReturnValue('mock-bucket')
    requireAttachmentsBucketNameMock.mockImplementation(() => {
      throw new Error('Attachment storage is not configured')
    })
    getDbMock.mockReturnValue(
      makeProgramDb([
        [{ plan: 'group', planStatus: 'active', trialEndsAt: null }],
        [
          {
            id: '11111111-1111-4111-8111-111111111111',
            userId: 'user-2',
            certificateFileKey:
              'evidence/org-1/training-certificates/11111111-1111-4111-8111-111111111111/certificate.pdf',
          },
        ],
        [{ id: 'membership-1' }],
      ]),
    )

    const { downloadTrainingCertificateFn } = await programModulePromise

    await expect(
      downloadTrainingCertificateFn({
        data: { recordId: '11111111-1111-4111-8111-111111111111' },
      }),
    ).resolves.toEqual({
      downloadUrl:
        '/api/uploads/mock?key=evidence%2Forg-1%2Ftraining-certificates%2F11111111-1111-4111-8111-111111111111%2Fcertificate.pdf',
    })

    expect(requireAttachmentsBucketNameMock).not.toHaveBeenCalled()
    expect(assertEvidenceFileScanCleanMock).not.toHaveBeenCalled()
    expect(generatePresignedDownloadUrlMock).not.toHaveBeenCalled()
  })

  it("does not download another user's training certificate for non-admin users", async () => {
    resolveActiveLocationAccessMock.mockResolvedValue(makeAccess('location_staff'))
    generatePresignedDownloadUrlMock.mockResolvedValue('https://signed-download.example')
    getDbMock.mockReturnValue(
      makeProgramDb([
        [{ plan: 'group', planStatus: 'active', trialEndsAt: null }],
        [
          {
            id: '11111111-1111-4111-8111-111111111111',
            userId: 'user-2',
            certificateFileKey:
              'evidence/org-1/training-certificates/11111111-1111-4111-8111-111111111111/certificate.pdf',
          },
        ],
      ]),
    )

    const { downloadTrainingCertificateFn } = await programModulePromise

    await expect(
      downloadTrainingCertificateFn({
        data: { recordId: '11111111-1111-4111-8111-111111111111' },
      }),
    ).rejects.toThrow('Training record not found')

    expect(generatePresignedDownloadUrlMock).not.toHaveBeenCalled()
  })

  it('rejects certificate downloads when no certificate was recorded', async () => {
    getDbMock.mockReturnValue(
      makeProgramDb([
        [{ plan: 'group', planStatus: 'active', trialEndsAt: null }],
        [
          {
            id: '11111111-1111-4111-8111-111111111111',
            userId: 'user-1',
            certificateFileKey: null,
          },
        ],
        [{ id: 'membership-1' }],
      ]),
    )

    const { downloadTrainingCertificateFn } = await programModulePromise

    await expect(
      downloadTrainingCertificateFn({
        data: { recordId: '11111111-1111-4111-8111-111111111111' },
      }),
    ).rejects.toThrow('Training certificate not found')

    expect(generatePresignedDownloadUrlMock).not.toHaveBeenCalled()
  })

  it('rejects training certificate downloads for stored keys outside the record prefix', async () => {
    generatePresignedDownloadUrlMock.mockResolvedValue('https://signed-download.example')
    getDbMock.mockReturnValue(
      makeProgramDb([
        [{ plan: 'group', planStatus: 'active', trialEndsAt: null }],
        [
          {
            id: '11111111-1111-4111-8111-111111111111',
            userId: 'user-1',
            certificateFileKey:
              'evidence/org-1/training-certificates/22222222-2222-4222-8222-222222222222/certificate.pdf',
          },
        ],
        [{ id: 'membership-1' }],
      ]),
    )

    const { downloadTrainingCertificateFn } = await programModulePromise

    await expect(
      downloadTrainingCertificateFn({
        data: { recordId: '11111111-1111-4111-8111-111111111111' },
      }),
    ).rejects.toThrow('Invalid training certificate key')

    expect(generatePresignedDownloadUrlMock).not.toHaveBeenCalled()
  })

  it('verifies uploaded certificates exist before marking training complete', async () => {
    const db = makeTrainingCompletionDb()
    getDbMock.mockReturnValue(db)

    const { markTrainingCompletedFn } = await programModulePromise

    await markTrainingCompletedFn({
      data: {
        recordId: '11111111-1111-4111-8111-111111111111',
        certificateFileKey:
          'evidence/org-1/training-certificates/11111111-1111-4111-8111-111111111111/certificate.pdf',
      },
    })

    expect(assertObjectExistsMock).toHaveBeenCalledWith({
      bucket: 'attachments-bucket',
      key: 'evidence/org-1/training-certificates/11111111-1111-4111-8111-111111111111/certificate.pdf',
      maxBytes: 25 * 1024 * 1024,
    })
    expect(dispatchAttachmentScanRequestMock).toHaveBeenCalledWith({
      organizationId: 'org-1',
      key: 'evidence/org-1/training-certificates/11111111-1111-4111-8111-111111111111/certificate.pdf',
      bucket: 'attachments-bucket',
      contentType: 'application/pdf',
      sizeBytes: 128,
    })
    expect(db.updateSet).toHaveBeenCalledWith(
      expect.objectContaining({
        certificateFileKey:
          'evidence/org-1/training-certificates/11111111-1111-4111-8111-111111111111/certificate.pdf',
      }),
    )
  })

  it("does not probe certificate storage before rejecting another user's completion", async () => {
    resolveActiveLocationAccessMock.mockResolvedValue(makeAccess('location_staff'))
    assertObjectExistsMock.mockResolvedValue(undefined)
    getDbMock.mockReturnValue(
      makeProgramDb([
        [{ plan: 'group', planStatus: 'active', trialEndsAt: null }],
        [
          {
            id: '11111111-1111-4111-8111-111111111111',
            userId: 'user-2',
          },
        ],
      ]),
    )

    const { markTrainingCompletedFn } = await programModulePromise

    await expect(
      markTrainingCompletedFn({
        data: {
          recordId: '11111111-1111-4111-8111-111111111111',
          certificateFileKey:
            'evidence/org-1/training-certificates/11111111-1111-4111-8111-111111111111/certificate.pdf',
        },
      }),
    ).rejects.toThrow('Training record not found')

    expect(assertObjectExistsMock).not.toHaveBeenCalled()
  })

  it('rejects certificate keys outside the training record evidence prefix', async () => {
    getDbMock.mockReturnValue(
      makeProgramDb([
        [{ plan: 'group', planStatus: 'active', trialEndsAt: null }],
        [
          {
            id: '11111111-1111-4111-8111-111111111111',
            userId: 'user-1',
          },
        ],
        [{ id: 'membership-1' }],
      ]),
    )

    const { markTrainingCompletedFn } = await programModulePromise

    await expect(
      markTrainingCompletedFn({
        data: {
          recordId: '11111111-1111-4111-8111-111111111111',
          certificateFileKey:
            'evidence/org-1/training-certificates/22222222-2222-4222-8222-222222222222/certificate.pdf',
        },
      }),
    ).rejects.toThrow('Invalid training certificate key')

    expect(assertObjectExistsMock).not.toHaveBeenCalled()
  })
})

describe('program vendors', () => {
  beforeAll(async () => {
    programModulePromise = import('./program.js')
    await programModulePromise
  }, 30_000)

  beforeEach(() => {
    vi.clearAllMocks()

    getSessionFnMock.mockResolvedValue(makeSession('user-1', 'org-1'))
    requireFeatureForOrgMock.mockImplementation(() => undefined)
    recordFeatureUsageMock.mockResolvedValue(undefined)
    resolveActiveLocationAccessMock.mockResolvedValue(makeAccess('org_admin'))
    isMockUploadsEnabledMock.mockReturnValue(false)
    requireAttachmentsBucketNameMock.mockReturnValue('attachments-bucket')
    assertObjectExistsMock.mockResolvedValue({
      contentType: 'application/pdf',
      sizeBytes: 128,
    })
    buildVendorBaaEvidenceKeyMock.mockReturnValue('evidence/org-1/vendor-baas/vendor-1/baa.pdf')
    generatePresignedUploadUrlMock.mockResolvedValue('https://signed-upload.example')
  })

  it('returns vendors with their latest BAA evidence and expiry metadata', async () => {
    const oldSignedAt = new Date('2025-01-01T00:00:00.000Z')
    const signedAt = new Date('2026-01-01T00:00:00.000Z')
    const expiresAt = new Date('2027-01-01T00:00:00.000Z')
    const db = makeProgramDb([
      [{ plan: 'group', planStatus: 'active', trialEndsAt: null }],
      [
        {
          id: 'vendor-1',
          tenantId: 'org-1',
          name: 'Secure Docs',
          website: 'https://secure.example',
          contactEmail: 'security@example.com',
          dataCategories: [],
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      [
        {
          id: 'baa-current',
          vendorId: 'vendor-1',
          signedAt,
          expiresAt,
          documentFileKey: 'evidence/org-1/vendor-baas/vendor-1/baa.pdf',
          signerName: 'Dr. Smith',
          signerEmail: 'smith@example.com',
          createdAt: signedAt,
          updatedAt: signedAt,
        },
        {
          id: 'baa-old',
          vendorId: 'vendor-1',
          signedAt: oldSignedAt,
          expiresAt: new Date('2025-12-31T00:00:00.000Z'),
          documentFileKey: null,
          signerName: 'Dr. Smith',
          signerEmail: 'smith@example.com',
          createdAt: oldSignedAt,
          updatedAt: oldSignedAt,
        },
      ],
    ])
    getDbMock.mockReturnValue(db)

    const { listVendorsFn } = await programModulePromise

    const result = await listVendorsFn()

    expect(result).toMatchObject({
      canAdmin: true,
      vendors: [
        {
          id: 'vendor-1',
          latestBaa: {
            id: 'baa-current',
            expiresAt,
            hasEvidence: true,
            baaState: 'current',
          },
        },
      ],
    })
    expect(result.vendors[0].latestBaa).not.toHaveProperty('documentFileKey')
  })

  it('creates vendors with trimmed data categories', async () => {
    const db = makeVendorCreateDb()
    getDbMock.mockReturnValue(db)

    const { createVendorFn } = await programModulePromise

    await createVendorFn({
      data: {
        name: 'Secure Docs',
        website: 'https://secure.example',
        contactEmail: 'security@example.com',
        dataCategories: [' PHI ', '', 'Billing records'],
      },
    })

    expect(db.insertValues).toHaveBeenCalledWith({
      tenantId: 'org-1',
      name: 'Secure Docs',
      website: 'https://secure.example',
      contactEmail: 'security@example.com',
      dataCategories: ['PHI', 'Billing records'],
    })
    expect(db.auditValues).toHaveBeenCalledWith(
      expect.objectContaining({
        tenantId: 'org-1',
        actorId: 'user-1',
        action: 'vendor.created',
        resourceType: 'vendor',
        resourceId: 'vendor-1',
      }),
    )
    expect(createTaskMock).toHaveBeenCalledWith(
      db,
      expect.objectContaining({
        tenantId: 'org-1',
        locationId: 'location-1',
        title: 'Obtain BAA for Secure Docs',
        createdBy: 'user-1',
      }),
    )
  })

  it('marks a tenant vendor inactive for administrators', async () => {
    const db = makeVendorInactiveDb(true)
    getDbMock.mockReturnValue(db)

    const { markVendorInactiveFn } = await programModulePromise

    await markVendorInactiveFn({
      data: {
        vendorId: '11111111-1111-4111-8111-111111111111',
      },
    })

    expect(db.updateSet).toHaveBeenCalledWith({ status: 'inactive' })
    expect(db.auditValues).toHaveBeenCalled()
  })

  it('blocks non-admin vendor status updates', async () => {
    resolveActiveLocationAccessMock.mockResolvedValue(makeAccess('location_staff'))
    const db = makeVendorInactiveDb(true)
    getDbMock.mockReturnValue(db)

    const { markVendorInactiveFn } = await programModulePromise

    await expect(
      markVendorInactiveFn({
        data: {
          vendorId: '11111111-1111-4111-8111-111111111111',
        },
      }),
    ).rejects.toThrow('Only administrators can update vendor status')

    expect(db.update).not.toHaveBeenCalled()
    expect(db.auditValues).not.toHaveBeenCalled()
  })

  it('presigns vendor BAA evidence uploads under the vendor evidence prefix', async () => {
    getDbMock.mockReturnValue(
      makeProgramDb([
        [{ plan: 'group', planStatus: 'active', trialEndsAt: null }],
        [{ id: 'vendor-1' }],
      ]),
    )
    const { presignVendorBaaUploadFn } = await programModulePromise

    await expect(
      presignVendorBaaUploadFn({
        data: {
          vendorId: 'vendor-1',
          filename: 'baa.pdf',
          contentType: 'application/pdf',
          sizeBytes: 1024,
        },
      }),
    ).resolves.toEqual({
      uploadUrl: 'https://signed-upload.example',
      key: 'evidence/org-1/vendor-baas/vendor-1/baa.pdf',
    })

    expect(buildVendorBaaEvidenceKeyMock).toHaveBeenCalledWith('org-1', 'vendor-1', 'baa.pdf')
    expect(generatePresignedUploadUrlMock).toHaveBeenCalledWith({
      bucket: 'attachments-bucket',
      key: 'evidence/org-1/vendor-baas/vendor-1/baa.pdf',
      organizationId: 'org-1',
      contentType: 'application/pdf',
      sizeBytes: 1024,
      expiresIn: 300,
    })
  })

  it('verifies uploaded BAA evidence exists before recording the document key', async () => {
    const db = makeVendorBaaRecordDb()
    getDbMock.mockReturnValue(db)

    const { recordVendorBaaFn } = await programModulePromise

    await recordVendorBaaFn({
      data: {
        vendorId: '11111111-1111-4111-8111-111111111111',
        signedAt: '2026-01-01T00:00:00.000Z',
        signerName: 'Dr. Smith',
        signerEmail: 'smith@example.com',
        documentFileKey: 'evidence/org-1/vendor-baas/11111111-1111-4111-8111-111111111111/baa.pdf',
      },
    })

    expect(assertObjectExistsMock).toHaveBeenCalledWith({
      bucket: 'attachments-bucket',
      key: 'evidence/org-1/vendor-baas/11111111-1111-4111-8111-111111111111/baa.pdf',
      maxBytes: 25 * 1024 * 1024,
    })
    expect(dispatchAttachmentScanRequestMock).toHaveBeenCalledWith({
      organizationId: 'org-1',
      key: 'evidence/org-1/vendor-baas/11111111-1111-4111-8111-111111111111/baa.pdf',
      bucket: 'attachments-bucket',
      contentType: 'application/pdf',
      sizeBytes: 128,
    })
    expect(db.insertValues).toHaveBeenCalled()
  })

  it('does not create scan state or dispatch scanner work for missing vendors', async () => {
    const db = makeMissingVendorBaaRecordDb()
    getDbMock.mockReturnValue(db)

    const { recordVendorBaaFn } = await programModulePromise

    await expect(
      recordVendorBaaFn({
        data: {
          vendorId: '11111111-1111-4111-8111-111111111111',
          signedAt: '2026-01-01T00:00:00.000Z',
          signerName: 'Dr. Smith',
          signerEmail: 'smith@example.com',
          documentFileKey:
            'evidence/org-1/vendor-baas/11111111-1111-4111-8111-111111111111/baa.pdf',
        },
      }),
    ).rejects.toThrow('Vendor not found')

    expect(assertObjectExistsMock).not.toHaveBeenCalled()
    expect(recordEvidenceFileScanPendingMock).not.toHaveBeenCalled()
    expect(dispatchAttachmentScanRequestMock).not.toHaveBeenCalled()
    expect(db.insert).not.toHaveBeenCalled()
  })

  it('schedules a BAA renewal review task when recording an expiring agreement', async () => {
    const db = makeVendorBaaRecordDb()
    getDbMock.mockReturnValue(db)

    const { recordVendorBaaFn } = await programModulePromise

    await recordVendorBaaFn({
      data: {
        vendorId: '11111111-1111-4111-8111-111111111111',
        signedAt: '2026-01-01T00:00:00.000Z',
        signerName: 'Dr. Smith',
        signerEmail: 'smith@example.com',
        expiresAt: '2027-01-31T00:00:00.000Z',
      },
    })

    expect(createTaskMock).toHaveBeenCalledWith(
      db,
      expect.objectContaining({
        tenantId: 'org-1',
        locationId: 'location-1',
        title: 'Review BAA renewal for Secure Docs',
        dueAt: new Date('2026-11-02T00:00:00.000Z'),
        createdBy: 'user-1',
      }),
    )
  })

  it('downloads vendor BAA evidence for administrators', async () => {
    generatePresignedDownloadUrlMock.mockResolvedValue('https://signed-download.example')
    getDbMock.mockReturnValue(
      makeProgramDb([
        [{ plan: 'group', planStatus: 'active', trialEndsAt: null }],
        [
          {
            id: 'baa-1',
            vendorId: '11111111-1111-4111-8111-111111111111',
            documentFileKey:
              'evidence/org-1/vendor-baas/11111111-1111-4111-8111-111111111111/baa.pdf',
          },
        ],
      ]),
    )

    const { downloadVendorBaaEvidenceFn } = await programModulePromise

    await expect(
      downloadVendorBaaEvidenceFn({
        data: { baaId: '11111111-1111-4111-8111-222222222222' },
      }),
    ).resolves.toEqual({ downloadUrl: 'https://signed-download.example' })

    expect(generatePresignedDownloadUrlMock).toHaveBeenCalledWith({
      bucket: 'attachments-bucket',
      key: 'evidence/org-1/vendor-baas/11111111-1111-4111-8111-111111111111/baa.pdf',
      organizationId: 'org-1',
      expiresIn: 900,
    })
  })

  it('downloads mock vendor BAA evidence without configured attachment storage', async () => {
    isMockUploadsEnabledMock.mockReturnValue(true)
    getEffectiveAttachmentsBucketNameMock.mockReturnValue('mock-bucket')
    requireAttachmentsBucketNameMock.mockImplementation(() => {
      throw new Error('Attachment storage is not configured')
    })
    getDbMock.mockReturnValue(
      makeProgramDb([
        [{ plan: 'group', planStatus: 'active', trialEndsAt: null }],
        [
          {
            id: 'baa-1',
            vendorId: '11111111-1111-4111-8111-111111111111',
            documentFileKey:
              'evidence/org-1/vendor-baas/11111111-1111-4111-8111-111111111111/baa.pdf',
          },
        ],
      ]),
    )

    const { downloadVendorBaaEvidenceFn } = await programModulePromise

    await expect(
      downloadVendorBaaEvidenceFn({
        data: { baaId: '11111111-1111-4111-8111-222222222222' },
      }),
    ).resolves.toEqual({
      downloadUrl:
        '/api/uploads/mock?key=evidence%2Forg-1%2Fvendor-baas%2F11111111-1111-4111-8111-111111111111%2Fbaa.pdf',
    })

    expect(requireAttachmentsBucketNameMock).not.toHaveBeenCalled()
    expect(assertEvidenceFileScanCleanMock).not.toHaveBeenCalled()
    expect(generatePresignedDownloadUrlMock).not.toHaveBeenCalled()
  })

  it('blocks non-admin vendor BAA evidence downloads', async () => {
    resolveActiveLocationAccessMock.mockResolvedValue(makeAccess('location_staff'))
    getDbMock.mockReturnValue(
      makeProgramDb([[{ plan: 'group', planStatus: 'active', trialEndsAt: null }]]),
    )

    const { downloadVendorBaaEvidenceFn } = await programModulePromise

    await expect(
      downloadVendorBaaEvidenceFn({
        data: { baaId: '11111111-1111-4111-8111-222222222222' },
      }),
    ).rejects.toThrow('Only administrators can download BAA evidence')

    expect(generatePresignedDownloadUrlMock).not.toHaveBeenCalled()
  })

  it('rejects vendor BAA downloads when no evidence file was recorded', async () => {
    generatePresignedDownloadUrlMock.mockResolvedValue('https://signed-download.example')
    getDbMock.mockReturnValue(
      makeProgramDb([
        [{ plan: 'group', planStatus: 'active', trialEndsAt: null }],
        [
          {
            id: 'baa-1',
            vendorId: '11111111-1111-4111-8111-111111111111',
            documentFileKey: null,
          },
        ],
      ]),
    )

    const { downloadVendorBaaEvidenceFn } = await programModulePromise

    await expect(
      downloadVendorBaaEvidenceFn({
        data: { baaId: '11111111-1111-4111-8111-222222222222' },
      }),
    ).rejects.toThrow('BAA evidence not found')

    expect(generatePresignedDownloadUrlMock).not.toHaveBeenCalled()
  })

  it('rejects vendor BAA downloads for stored keys outside the vendor prefix', async () => {
    generatePresignedDownloadUrlMock.mockResolvedValue('https://signed-download.example')
    getDbMock.mockReturnValue(
      makeProgramDb([
        [{ plan: 'group', planStatus: 'active', trialEndsAt: null }],
        [
          {
            id: 'baa-1',
            vendorId: '11111111-1111-4111-8111-111111111111',
            documentFileKey:
              'evidence/org-1/vendor-baas/22222222-2222-4222-8222-222222222222/baa.pdf',
          },
        ],
      ]),
    )

    const { downloadVendorBaaEvidenceFn } = await programModulePromise

    await expect(
      downloadVendorBaaEvidenceFn({
        data: { baaId: '11111111-1111-4111-8111-222222222222' },
      }),
    ).rejects.toThrow('Invalid BAA document key')

    expect(generatePresignedDownloadUrlMock).not.toHaveBeenCalled()
  })
})

function makeProgramDb(results: unknown[][]) {
  return {
    select: vi.fn().mockImplementation(() => {
      const chain = {
        from: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
        innerJoin: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn(async () => results.shift() ?? []),
        then: (resolve: (value: unknown[]) => unknown, reject?: (reason?: unknown) => unknown) =>
          Promise.resolve(results.shift() ?? []).then(resolve, reject),
      }

      return chain
    }),
  }
}

function makeProgramPolicyCreateDb() {
  const results = [
    [{ plan: 'group', planStatus: 'active', trialEndsAt: null }],
    [{ id: 'membership-1' }],
  ]
  const created = {
    id: 'policy-created',
    tenantId: 'org-1',
    title: 'Sanctions Policy',
    bodyMarkdown: 'Policy body',
    version: '1.0',
    effectiveDate: new Date('2026-06-01T00:00:00.000Z'),
    requiresAcknowledgement: true,
    status: 'draft',
  }
  const insertValues = vi.fn().mockReturnValue({
    returning: vi.fn().mockResolvedValue([created]),
  })
  const auditValues = vi.fn().mockResolvedValue(undefined)
  let insertCall = 0
  const db = {
    select: vi.fn().mockImplementation(() => ({
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn(async () => results.shift() ?? []),
    })),
    insert: vi.fn(() => {
      insertCall += 1
      return { values: insertCall === 1 ? insertValues : auditValues }
    }),
    transaction: vi.fn(),
    insertValues,
  }
  db.transaction.mockImplementation((fn: (tx: typeof db) => Promise<unknown>) => fn(db))

  return db
}

function makeProgramPolicyUpdateDb() {
  const before = {
    id: '11111111-1111-4111-8111-111111111111',
    tenantId: 'org-1',
    title: 'Access Policy',
    bodyMarkdown: 'Policy body',
    version: '1.0',
    effectiveDate: null,
    requiresAcknowledgement: true,
    status: 'draft',
  }
  const after = {
    ...before,
    title: 'Updated Policy',
    bodyMarkdown: 'Updated body',
    version: '2.0',
    requiresAcknowledgement: false,
  }
  const results = [
    [{ plan: 'group', planStatus: 'active', trialEndsAt: null }],
    [before],
    [{ id: 'membership-1' }],
  ]
  const updateSet = vi.fn().mockReturnValue({
    where: vi.fn().mockReturnValue({
      returning: vi.fn().mockResolvedValue([after]),
    }),
  })
  const db = {
    select: vi.fn().mockImplementation(() => ({
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn(async () => results.shift() ?? []),
    })),
    update: vi.fn().mockReturnValue({ set: updateSet }),
    insert: vi.fn().mockReturnValue({ values: vi.fn().mockResolvedValue(undefined) }),
    transaction: vi.fn(),
    updateSet,
  }
  db.transaction.mockImplementation((fn: (tx: typeof db) => Promise<unknown>) => fn(db))

  return db
}

function makeRiskAssessmentStatusDb(assessmentExists: boolean) {
  const assessment = {
    id: '11111111-1111-4111-8111-111111111111',
    tenantId: 'org-1',
    title: 'Annual HIPAA Risk Assessment',
    status: 'open',
    reviewerId: null,
    reviewedAt: null,
  }
  const results = [
    [{ plan: 'group', planStatus: 'active', trialEndsAt: null }],
    assessmentExists ? [assessment] : [],
    assessmentExists ? [{ id: 'membership-1' }] : [],
  ]
  const updateSet = vi.fn((updates) => ({
    where: vi.fn().mockReturnValue({
      returning: vi.fn().mockResolvedValue([{ ...assessment, ...updates }]),
    }),
  }))
  const auditValues = vi.fn().mockResolvedValue(undefined)
  let insertCall = 0
  const db = {
    select: vi.fn().mockImplementation(() => ({
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn(async () => results.shift() ?? []),
    })),
    update: vi.fn().mockReturnValue({ set: updateSet }),
    insert: vi.fn(() => {
      insertCall += 1
      return {
        values: insertCall === 1 ? auditValues : vi.fn().mockResolvedValue(undefined),
      }
    }),
    transaction: vi.fn(),
    updateSet,
    auditValues,
  }
  db.transaction.mockImplementation((fn: (tx: typeof db) => Promise<unknown>) => fn(db))

  return db
}

function makeRiskItemUpdateDb(itemExists: boolean, ownerExists = true, includeOwnerLookup = true) {
  const current = {
    id: '11111111-1111-4111-8111-111111111111',
    assessmentId: 'assessment-1',
    category: 'Access Control',
    description: 'Shared admin account in use',
    likelihood: 4,
    impact: 5,
    score: 20,
    status: 'critical',
    mitigation: 'Move each admin to a named account',
    ownerId: null,
    dueAt: null,
  }
  const results = [
    [{ plan: 'group', planStatus: 'active', trialEndsAt: null }],
    ...(includeOwnerLookup ? [ownerExists ? [{ id: 'membership-1' }] : []] : []),
    itemExists ? [current] : [],
    itemExists ? [{ id: 'membership-actor' }] : [],
    ...(includeOwnerLookup ? [ownerExists ? [{ id: 'membership-owner' }] : []] : []),
    itemExists ? [{ id: current.id, assessmentStatus: 'open' }] : [],
  ]
  const updateSet = vi.fn((updates) => ({
    where: vi.fn().mockReturnValue({
      returning: vi.fn().mockResolvedValue([{ ...current, ...updates }]),
    }),
  }))
  const auditValues = vi.fn().mockResolvedValue(undefined)
  let insertCall = 0
  const db = {
    select: vi.fn().mockImplementation(() => ({
      from: vi.fn().mockReturnThis(),
      innerJoin: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn(async () => results.shift() ?? []),
    })),
    update: vi.fn().mockReturnValue({ set: updateSet }),
    insert: vi.fn(() => {
      insertCall += 1
      return {
        values: insertCall === 1 ? auditValues : vi.fn().mockResolvedValue(undefined),
      }
    }),
    transaction: vi.fn(),
    updateSet,
    auditValues,
  }
  db.transaction.mockImplementation((fn: (tx: typeof db) => Promise<unknown>) => fn(db))

  return db
}

function makeRiskItemCreateDb(ownerExists = true) {
  const created = {
    id: 'risk-item-1',
    assessmentId: '11111111-1111-4111-8111-111111111111',
    category: 'Access Control',
    description: 'Privileged account review is overdue',
    likelihood: 3,
    impact: 5,
    score: 15,
    status: 'high',
    mitigation: 'Complete quarterly access review',
    ownerId: '22222222-2222-4222-8222-222222222222',
    dueAt: new Date('2026-07-01T00:00:00.000Z'),
  }
  const results = [
    [{ plan: 'group', planStatus: 'active', trialEndsAt: null }],
    ownerExists ? [{ id: 'membership-1' }] : [],
    [{ id: '11111111-1111-4111-8111-111111111111', status: 'open' }],
    [{ id: 'membership-actor' }],
    ownerExists ? [{ id: 'membership-owner' }] : [],
    [{ id: '11111111-1111-4111-8111-111111111111', status: 'open' }],
  ]
  const insertValues = vi.fn().mockReturnValue({
    returning: vi.fn().mockResolvedValue([created]),
  })
  const auditValues = vi.fn().mockResolvedValue(undefined)
  let insertCall = 0
  const db = {
    select: vi.fn().mockImplementation(() => ({
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn(async () => results.shift() ?? []),
    })),
    insert: vi.fn(() => {
      insertCall += 1
      return { values: insertCall === 1 ? insertValues : auditValues }
    }),
    transaction: vi.fn(),
    insertValues,
    auditValues,
  }
  db.transaction.mockImplementation((fn: (tx: typeof db) => Promise<unknown>) => fn(db))

  return db
}

function makeVendorBaaRecordDb() {
  const vendor = {
    id: '11111111-1111-4111-8111-111111111111',
    name: 'Secure Docs',
  }
  const results = [
    [{ plan: 'group', planStatus: 'active', trialEndsAt: null }],
    [vendor],
    [vendor],
    [{ id: 'membership-1' }],
    [{ id: 'location-1' }],
  ]
  const insertValues = vi.fn().mockReturnValue({
    returning: vi.fn().mockResolvedValue([
      {
        id: 'baa-1',
        vendorId: '11111111-1111-4111-8111-111111111111',
        signedAt: new Date('2026-01-01T00:00:00.000Z'),
        signerName: 'Dr. Smith',
        signerEmail: 'smith@example.com',
      },
    ]),
  })
  const updateSet = vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) })
  const auditValues = vi.fn().mockResolvedValue(undefined)

  let insertCall = 0
  const db = {
    select: vi.fn().mockImplementation(() => ({
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn(async () => results.shift() ?? []),
    })),
    insert: vi.fn(() => {
      insertCall += 1
      return {
        values: insertCall === 1 ? insertValues : auditValues,
      }
    }),
    update: vi.fn().mockReturnValue({ set: updateSet }),
    transaction: vi.fn(),
    insertValues,
  }
  db.transaction.mockImplementation((fn: (tx: typeof db) => Promise<unknown>) => fn(db))

  return db
}

function makeMissingVendorBaaRecordDb() {
  const results = [[{ plan: 'group', planStatus: 'active', trialEndsAt: null }], []]
  return {
    select: vi.fn().mockImplementation(() => ({
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn(async () => results.shift() ?? []),
    })),
    insert: vi.fn(),
    update: vi.fn(),
    transaction: vi.fn(),
  }
}

function makeVendorCreateDb() {
  const results = [
    [{ plan: 'group', planStatus: 'active', trialEndsAt: null }],
    [{ id: 'membership-1' }],
    [{ id: 'location-1' }],
  ]
  const created = {
    id: 'vendor-1',
    tenantId: 'org-1',
    name: 'Secure Docs',
    website: 'https://secure.example',
    contactEmail: 'security@example.com',
    dataCategories: ['PHI', 'Billing records'],
    status: 'active',
  }
  const insertValues = vi.fn().mockReturnValue({
    returning: vi.fn().mockResolvedValue([created]),
  })
  const auditValues = vi.fn().mockResolvedValue(undefined)
  let insertCall = 0
  const db = {
    select: vi.fn().mockImplementation(() => ({
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn(async () => results.shift() ?? []),
    })),
    insert: vi.fn(() => {
      insertCall += 1
      return { values: insertCall === 1 ? insertValues : auditValues }
    }),
    transaction: vi.fn(),
    insertValues,
    auditValues,
  }
  db.transaction.mockImplementation((fn: (tx: typeof db) => Promise<unknown>) => fn(db))

  return db
}

function makeVendorInactiveDb(vendorExists: boolean) {
  const results = [
    [{ plan: 'group', planStatus: 'active', trialEndsAt: null }],
    vendorExists ? [{ id: '11111111-1111-4111-8111-111111111111' }] : [],
    vendorExists ? [{ id: 'membership-1' }] : [],
  ]
  const updateSet = vi.fn().mockReturnValue({
    where: vi.fn().mockReturnValue({
      returning: vi.fn().mockResolvedValue([
        { id: '11111111-1111-4111-8111-111111111111', status: 'inactive' },
      ]),
    }),
  })
  const auditValues = vi.fn().mockResolvedValue(undefined)
  let insertCall = 0
  const db = {
    select: vi.fn().mockImplementation(() => ({
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn(async () => results.shift() ?? []),
    })),
    update: vi.fn().mockReturnValue({ set: updateSet }),
    insert: vi.fn(() => {
      insertCall += 1
      return {
        values: insertCall === 1 ? auditValues : vi.fn().mockResolvedValue(undefined),
      }
    }),
    transaction: vi.fn(),
    updateSet,
    auditValues,
  }
  db.transaction.mockImplementation((fn: (tx: typeof db) => Promise<unknown>) => fn(db))

  return db
}

function makeTrainingCompletionDb() {
  const results = [
    [{ plan: 'group', planStatus: 'active', trialEndsAt: null }],
    [
      {
        id: '11111111-1111-4111-8111-111111111111',
        userId: 'user-1',
      },
    ],
    [{ id: 'membership-1' }],
    [
      {
        id: '11111111-1111-4111-8111-111111111111',
        userId: 'user-1',
        courseId: '22222222-2222-4222-8222-222222222222',
        status: 'in_progress',
      },
    ],
    [{ id: '22222222-2222-4222-8222-222222222222' }],
    [{ id: 'membership-1' }],
    [{ id: 'membership-actor' }],
  ]
  const updateSet = vi.fn().mockReturnValue({
    where: vi.fn().mockReturnValue({
      returning: vi.fn().mockResolvedValue([
        {
          id: '11111111-1111-4111-8111-111111111111',
          userId: 'user-1',
          courseId: '22222222-2222-4222-8222-222222222222',
          status: 'completed',
        },
      ]),
    }),
  })

  const db = {
    select: vi.fn().mockImplementation(() => ({
      from: vi.fn().mockReturnThis(),
      innerJoin: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn(async () => results.shift() ?? []),
    })),
    update: vi.fn().mockReturnValue({ set: updateSet }),
    insert: vi.fn().mockReturnValue({ values: vi.fn().mockResolvedValue(undefined) }),
    transaction: vi.fn(),
    updateSet,
  }
  db.transaction.mockImplementation((fn: (tx: typeof db) => Promise<unknown>) => fn(db))

  return db
}

function makeTrainingCourseCreateDb() {
  const results = [
    [{ plan: 'group', planStatus: 'active', trialEndsAt: null }],
    [{ id: 'membership-1' }],
  ]
  const course = {
    id: 'course-1',
    tenantId: 'org-1',
    title: 'HIPAA Basics',
    description: 'Annual HIPAA training',
    frequencyDays: 365,
    isActive: true,
  }
  const insertValues = vi.fn().mockReturnValue({
    returning: vi.fn().mockResolvedValue([course]),
  })
  const auditValues = vi.fn().mockResolvedValue(undefined)
  let insertCall = 0
  const db = {
    select: vi.fn().mockImplementation(() => ({
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn(async () => results.shift() ?? []),
    })),
    insert: vi.fn(() => {
      insertCall += 1
      return {
        values: insertCall === 1 ? insertValues : auditValues,
      }
    }),
    transaction: vi.fn(),
    insertValues,
  }
  db.transaction.mockImplementation((fn: (tx: typeof db) => Promise<unknown>) => fn(db))

  return db
}

function makeTrainingCourseDeactivateDb() {
  const results = [
    [{ plan: 'group', planStatus: 'active', trialEndsAt: null }],
    [
      {
        id: '11111111-1111-4111-8111-111111111111',
        tenantId: 'org-1',
        title: 'HIPAA Basics',
        description: null,
        frequencyDays: 365,
        isActive: true,
      },
    ],
    [{ id: 'membership-1' }],
  ]
  const updateSet = vi.fn().mockReturnValue({
    where: vi.fn().mockReturnValue({
      returning: vi.fn().mockResolvedValue([{ id: '11111111-1111-4111-8111-111111111111' }]),
    }),
  })
  const db = {
    select: vi.fn().mockImplementation(() => ({
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn(async () => results.shift() ?? []),
    })),
    update: vi.fn().mockReturnValue({ set: updateSet }),
    insert: vi.fn().mockReturnValue({ values: vi.fn().mockResolvedValue(undefined) }),
    transaction: vi.fn(),
    updateSet,
  }
  db.transaction.mockImplementation((fn: (tx: typeof db) => Promise<unknown>) => fn(db))

  return db
}

function makeAccess(
  role: 'auditor' | 'location_staff' | 'org_admin',
  overrides?: {
    commercial?: {
      plan: string | null
      planStatus:
        | 'selection_required'
        | 'trial_pending'
        | 'trialing'
        | 'active'
        | 'paused'
        | 'past_due'
        | 'canceled'
      trialStartedAt: Date | null
      trialEndsAt: Date | null
      stripeCustomerId: string | null
      stripeSubscriptionId: string | null
    } | null
  },
) {
  return {
    userId: 'user-1',
    organizationId: 'org-1',
    role,
    accessLevel: 'organization',
    allowedLocationIds: ['location-1'],
    locations: [{ id: 'location-1', name: 'Main Clinic' }],
    defaultLocationId: 'location-1',
    canAccessAllLocations: true,
    commercial: overrides?.commercial ?? null,
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
