import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { and, asc, count, desc, eq, inArray, sql } from 'drizzle-orm'
import {
  getDb,
  evidenceFileScans,
  memberships,
  organizations,
  policyAcknowledgements,
  programPolicies,
  riskAssessments,
  riskItems,
  trainingCourses,
  trainingRecords,
  users,
  vendorBaas,
  vendors,
} from '@phiguard/db/server'
import { recordFeatureUsage, requireFeatureForOrg } from '@phiguard/billing'
import {
  createPolicy,
  publishPolicy,
  updatePolicyDraft,
  acknowledgePolicy,
  listPendingAcknowledgements,
  createPolicyVersion,
  archivePolicy,
  restorePolicy,
  assignCourse,
  createTrainingCourse,
  deactivateTrainingCourse,
  markCompleted,
  computeDueStatus,
  summarizeAssessment,
  createRiskAssessment,
  createRiskItem,
  deleteRiskItem,
  updateRiskItem,
  updateRiskAssessmentStatus,
  listExpired,
  listExpiringSoon,
  getVendorBaaState,
  selectLatestBaasByVendor,
  createVendor,
  recordBaa,
  markVendorInactive,
  updateVendor,
  reactivateVendor,
  listVendorBaas,
  updateLatestVendorBaa,
  unassignTraining,
  reassignTraining,
  updateTrainingDueDate,
  reactivateTrainingCourse,
  reopenTrainingCompletion,
  reopenRiskAssessment,
  renameRiskAssessment,
  deleteRiskAssessment,
} from '@phiguard/compliance'
import { runInAuditContext } from '../lib/audit.server.js'
import { dispatchAttachmentScanRequest } from '../lib/attachment-scan.js'
import {
  assertEvidenceFileScanClean,
  recordEvidenceFileScanPending,
} from '../lib/evidence-file-scan.js'
import { getSessionFn } from '../lib/session.js'
import {
  ALLOWED_UPLOAD_CONTENT_TYPES,
  MAX_UPLOAD_BYTES,
  assertObjectExists,
  buildMockUploadUrl,
  buildTrainingCertificateKey,
  buildVendorBaaEvidenceKey,
  generatePresignedDownloadUrl,
  generatePresignedUploadUrl,
  getEffectiveAttachmentsBucketName,
  isMockUploadsEnabled,
  requireAttachmentsBucketName,
} from '../lib/s3.js'
import {
  assertCommercialProductAccess,
  canManageOrganization,
  canWriteLocations,
  resolveActiveLocationAccess,
  type ActiveLocationAccess,
} from './access.js'

async function requireProgramAccess() {
  const session = await getSessionFn()
  if (!session?.user?.id || !session.session.activeOrganizationId) {
    throw new Error('Unauthorized')
  }

  const db = getDb()
  const access = await resolveActiveLocationAccess(db, session)
  assertCommercialProductAccess(access)

  // Fetch org plan + status for feature gate (trial bypass)
  const [org] = await db
    .select({
      plan: organizations.plan,
      planStatus: organizations.planStatus,
      trialEndsAt: organizations.trialEndsAt,
    })
    .from(organizations)
    .where(eq(organizations.id, access.organizationId))
    .limit(1)

  if (!org) throw new Error('Organization not found')

  requireFeatureForOrg(org, 'compliance_addon')
  if (org.planStatus === 'trialing') {
    void recordFeatureUsage(db, access.organizationId, 'compliance_addon').catch(() => {
      // best-effort
    })
  }

  return { db, access, plan: org.plan }
}

function canAcknowledgeProgramPolicy(access: ActiveLocationAccess): boolean {
  return canWriteLocations(access)
}

function isValidDateOnly(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return false

  const [, yearText, monthText, dayText] = match
  const year = Number(yearText)
  const month = Number(monthText)
  const day = Number(dayText)
  const date = new Date(Date.UTC(year, month - 1, day))

  return (
    date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
  )
}

const optionalDateOnly = z
  .string()
  .refine(isValidDateOnly, 'Expected date in YYYY-MM-DD format')
  .optional()

function normalizeDataCategories(categories: string[] | undefined) {
  const normalized = categories?.map((category) => category.trim()).filter(Boolean) ?? []
  return [...new Set(normalized)]
}

function assertVendorBaaDocumentKey(tenantId: string, vendorId: string, key: string) {
  const expectedPrefix = `evidence/${tenantId}/vendor-baas/${vendorId}/`
  if (!key.startsWith(expectedPrefix)) {
    throw new Error('Invalid BAA document key')
  }

  return key
}

function assertTrainingCertificateKey(tenantId: string, recordId: string, key: string) {
  const expectedPrefix = `evidence/${tenantId}/training-certificates/${recordId}/`
  if (!key.startsWith(expectedPrefix)) {
    throw new Error('Invalid training certificate key')
  }

  return key
}

// ---------------------------------------------------------------------------
// Program Dashboard
// ---------------------------------------------------------------------------

export const getProgramDashboardFn = createServerFn({ method: 'GET' }).handler(async () => {
  const { db, access } = await requireProgramAccess()

  return runInAuditContext(access.userId, async () => {
    const tenantId = access.organizationId

    // Policies: published count + pending acknowledgement count across organization members.
    const [publishedPolicyRow] = await db
      .select({ count: count() })
      .from(programPolicies)
      .where(and(eq(programPolicies.tenantId, tenantId), eq(programPolicies.status, 'published')))

    const requiredPolicies = await db
      .select({ id: programPolicies.id })
      .from(programPolicies)
      .where(
        and(
          eq(programPolicies.tenantId, tenantId),
          eq(programPolicies.status, 'published'),
          eq(programPolicies.requiresAcknowledgement, true),
        ),
      )

    const memberRows = await db
      .select({ userId: memberships.userId })
      .from(memberships)
      .where(eq(memberships.tenantId, tenantId))

    let pendingAckCount = requiredPolicies.length * memberRows.length
    if (pendingAckCount > 0) {
      const policyIds = requiredPolicies.map((policy) => policy.id)
      const userIds = memberRows.map((member) => member.userId)
      const acknowledgementRows = await db
        .select({
          policyId: policyAcknowledgements.policyId,
          userId: policyAcknowledgements.userId,
        })
        .from(policyAcknowledgements)
        .where(
          and(
            inArray(policyAcknowledgements.policyId, policyIds),
            inArray(policyAcknowledgements.userId, userIds),
          ),
        )

      const acknowledgedPairs = new Set(
        acknowledgementRows.map((row) => `${row.policyId}:${row.userId}`),
      )
      pendingAckCount -= acknowledgedPairs.size
    }

    // Training: overdue + due soon across all organization training records.
    const allRecords = await db
      .select({
        status: trainingRecords.status,
        dueAt: trainingRecords.dueAt,
      })
      .from(trainingRecords)
      .innerJoin(trainingCourses, eq(trainingRecords.courseId, trainingCourses.id))
      .where(eq(trainingCourses.tenantId, tenantId))

    const now = new Date()
    let overdueCount = 0
    let dueSoonCount = 0
    for (const record of allRecords) {
      const status = computeDueStatus({ status: record.status, dueAt: record.dueAt }, now)
      if (status === 'overdue') overdueCount++
      else if (status === 'due_soon') dueSoonCount++
    }

    // Risk: high-risk open items
    const openAssessments = await db
      .select({ id: riskAssessments.id })
      .from(riskAssessments)
      .where(and(eq(riskAssessments.tenantId, tenantId), eq(riskAssessments.status, 'open')))

    let highRiskCount = 0
    if (openAssessments.length > 0) {
      const assessmentIds = openAssessments.map((a) => a.id)
      const items = await db
        .select({ score: riskItems.score })
        .from(riskItems)
        .where(sql`${riskItems.assessmentId} = ANY(${assessmentIds})`)
      const summary = summarizeAssessment(items)
      highRiskCount = summary.high
    }

    // Vendors: BAAs expired or expiring in 60 days
    const expiringSoon = await listExpiringSoon(db, {
      tenantId,
      withinDays: 60,
    })
    const expired = await listExpired(db, { tenantId })

    return {
      policies: {
        publishedCount: publishedPolicyRow?.count ?? 0,
        pendingAckCount,
      },
      training: {
        overdueCount,
        dueSoonCount,
      },
      risk: {
        highRiskCount,
      },
      vendors: {
        expiringBaaCount: expiringSoon.length,
        expiredBaaCount: expired.length,
      },
    }
  })
})

// ---------------------------------------------------------------------------
// Policies
// ---------------------------------------------------------------------------

export const listProgramPoliciesFn = createServerFn({ method: 'GET' }).handler(async () => {
  const { db, access } = await requireProgramAccess()

  return runInAuditContext(access.userId, async () => {
    const canAdmin = canManageOrganization(access)
    const conditions = [eq(programPolicies.tenantId, access.organizationId)]
    if (!canAdmin) {
      conditions.push(eq(programPolicies.status, 'published'))
    }

    const rows = await db
      .select()
      .from(programPolicies)
      .where(and(...conditions))
    const visibleRows = canAdmin ? rows : rows.filter((policy) => policy.status === 'published')

    const pending = await listPendingAcknowledgements(db, {
      userId: access.userId,
      tenantId: access.organizationId,
    })
    const pendingIds = new Set(pending.map((p) => p.id))

    return {
      policies: visibleRows.map((policy) => ({
        ...policy,
        pendingAck: pendingIds.has(policy.id),
      })),
      canAdmin,
    }
  })
})

export const getProgramPolicyFn = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ policyId: z.string().uuid() }))
  .handler(async ({ data }) => {
    const { db, access } = await requireProgramAccess()

    return runInAuditContext(access.userId, async () => {
      const [policy] = await db
        .select()
        .from(programPolicies)
        .where(
          and(
            eq(programPolicies.id, data.policyId),
            eq(programPolicies.tenantId, access.organizationId),
          ),
        )
        .limit(1)

      if (!policy) throw new Error('Policy not found')
      const canAdmin = canManageOrganization(access)
      if (!canAdmin && policy.status !== 'published') {
        throw new Error('Policy not found')
      }

      const [ack] = await db
        .select()
        .from(policyAcknowledgements)
        .where(
          and(
            eq(policyAcknowledgements.policyId, data.policyId),
            eq(policyAcknowledgements.userId, access.userId),
          ),
        )
        .limit(1)

      return {
        policy,
        hasAcknowledged: !!ack,
        canAcknowledge: canAcknowledgeProgramPolicy(access),
        canAdmin,
      }
    })
  })

const policyDraftInput = z.object({
  title: z.string().trim().min(1).max(200),
  bodyMarkdown: z.string().trim().min(1).max(50_000),
  version: z.string().trim().min(1).max(40),
  effectiveDate: optionalDateOnly,
  requiresAcknowledgement: z.boolean(),
})

export const createProgramPolicyFn = createServerFn({ method: 'POST' })
  .inputValidator(policyDraftInput)
  .handler(async ({ data }) => {
    const { db, access } = await requireProgramAccess()

    if (!canManageOrganization(access)) {
      throw new Error('Only administrators can manage policies')
    }

    return runInAuditContext(access.userId, () =>
      createPolicy(db, {
        tenantId: access.organizationId,
        actorId: access.userId,
        title: data.title,
        bodyMarkdown: data.bodyMarkdown,
        version: data.version,
        effectiveDate: data.effectiveDate
          ? new Date(`${data.effectiveDate}T00:00:00.000Z`)
          : undefined,
        requiresAcknowledgement: data.requiresAcknowledgement,
      }),
    )
  })

export const updateProgramPolicyDraftFn = createServerFn({ method: 'POST' })
  .inputValidator(policyDraftInput.extend({ policyId: z.string().uuid() }))
  .handler(async ({ data }) => {
    const { db, access } = await requireProgramAccess()

    if (!canManageOrganization(access)) {
      throw new Error('Only administrators can manage policies')
    }

    return runInAuditContext(access.userId, () =>
      updatePolicyDraft(db, {
        policyId: data.policyId,
        tenantId: access.organizationId,
        actorId: access.userId,
        title: data.title,
        bodyMarkdown: data.bodyMarkdown,
        version: data.version,
        effectiveDate: data.effectiveDate
          ? new Date(`${data.effectiveDate}T00:00:00.000Z`)
          : undefined,
        requiresAcknowledgement: data.requiresAcknowledgement,
      }),
    )
  })

export const publishProgramPolicyFn = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ policyId: z.string().uuid() }))
  .handler(async ({ data }) => {
    const { db, access } = await requireProgramAccess()

    if (!canManageOrganization(access)) {
      throw new Error('Only administrators can publish policies')
    }

    return runInAuditContext(access.userId, () =>
      publishPolicy(db, {
        policyId: data.policyId,
        tenantId: access.organizationId,
        actorId: access.userId,
      }),
    )
  })

export const acknowledgeProgramPolicyFn = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ policyId: z.string().uuid() }))
  .handler(async ({ data }) => {
    const { db, access } = await requireProgramAccess()

    if (!canAcknowledgeProgramPolicy(access)) {
      throw new Error('Access denied')
    }

    return runInAuditContext(access.userId, () =>
      acknowledgePolicy(db, {
        policyId: data.policyId,
        userId: access.userId,
        tenantId: access.organizationId,
      }),
    )
  })

export const createPolicyVersionFn = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ policyId: z.string().uuid() }))
  .handler(async ({ data }) => {
    const { db, access } = await requireProgramAccess()

    if (!canManageOrganization(access)) {
      throw new Error('Only administrators can create policy versions')
    }

    return runInAuditContext(access.userId, () =>
      createPolicyVersion(db, {
        policyId: data.policyId,
        tenantId: access.organizationId,
        actorId: access.userId,
      }),
    )
  })

export const archivePolicyFn = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ policyId: z.string().uuid() }))
  .handler(async ({ data }) => {
    const { db, access } = await requireProgramAccess()

    if (!canManageOrganization(access)) {
      throw new Error('Only administrators can archive policies')
    }

    return runInAuditContext(access.userId, () =>
      archivePolicy(db, {
        policyId: data.policyId,
        tenantId: access.organizationId,
        actorId: access.userId,
      }),
    )
  })

export const restorePolicyFn = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ policyId: z.string().uuid() }))
  .handler(async ({ data }) => {
    const { db, access } = await requireProgramAccess()

    if (!canManageOrganization(access)) {
      throw new Error('Only administrators can restore policies')
    }

    return runInAuditContext(access.userId, () =>
      restorePolicy(db, {
        policyId: data.policyId,
        tenantId: access.organizationId,
        actorId: access.userId,
      }),
    )
  })

// ---------------------------------------------------------------------------
// Training
// ---------------------------------------------------------------------------

export const listTrainingRecordsFn = createServerFn({ method: 'GET' }).handler(async () => {
  const { db, access } = await requireProgramAccess()

  return runInAuditContext(access.userId, async () => {
    const now = new Date()
    const canAdmin = canManageOrganization(access)
    const canDownloadCertificates = canWriteLocations(access)
    const conditions = [eq(trainingCourses.tenantId, access.organizationId)]

    if (!canAdmin) {
      conditions.push(eq(trainingRecords.userId, access.userId))
    }

    const records = await db
      .select({
        id: trainingRecords.id,
        userId: trainingRecords.userId,
        courseId: trainingRecords.courseId,
        status: trainingRecords.status,
        completedAt: trainingRecords.completedAt,
        dueAt: trainingRecords.dueAt,
        certificateFileKey: trainingRecords.certificateFileKey,
        createdAt: trainingRecords.createdAt,
        updatedAt: trainingRecords.updatedAt,
        courseTitle: trainingCourses.title,
        userName: users.name,
        userEmail: users.email,
      })
      .from(trainingRecords)
      .leftJoin(trainingCourses, eq(trainingRecords.courseId, trainingCourses.id))
      .leftJoin(users, eq(trainingRecords.userId, users.id))
      .where(and(...conditions))

    const certificateKeys = records
      .map((record) => record.certificateFileKey)
      .filter((key): key is string => Boolean(key))
    const certificateScans = certificateKeys.length
      ? await db
          .select({
            s3Key: evidenceFileScans.s3Key,
            avStatus: evidenceFileScans.avStatus,
          })
          .from(evidenceFileScans)
          .where(
            and(
              eq(evidenceFileScans.tenantId, access.organizationId),
              inArray(evidenceFileScans.s3Key, certificateKeys),
            ),
          )
      : []
    const certificateStatusByKey = new Map(
      certificateScans.map((scan) => [scan.s3Key, scan.avStatus]),
    )

    const result = {
      canAdmin,
      canDownloadCertificates,
      records: records.map(({ certificateFileKey, ...record }) => ({
        ...record,
        hasCertificateFile: Boolean(certificateFileKey),
        certificateScanStatus: certificateFileKey
          ? (certificateStatusByKey.get(certificateFileKey) ?? null)
          : null,
        dueStatus: computeDueStatus({ status: record.status, dueAt: record.dueAt }, now),
      })),
      courses: [] as Array<{
        id: string
        title: string
        description: string | null
        frequencyDays: number
        isActive: boolean
      }>,
      users: [] as Array<{ id: string; name: string | null; email: string }>,
    }

    if (!canAdmin) {
      return result
    }

    const activeCourses = await db
      .select({
        id: trainingCourses.id,
        title: trainingCourses.title,
        description: trainingCourses.description,
        frequencyDays: trainingCourses.frequencyDays,
        isActive: trainingCourses.isActive,
      })
      .from(trainingCourses)
      .where(eq(trainingCourses.tenantId, access.organizationId))
      .orderBy(asc(trainingCourses.title))

    const assignableUsers = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
      })
      .from(memberships)
      .innerJoin(users, eq(memberships.userId, users.id))
      .where(eq(memberships.tenantId, access.organizationId))
      .orderBy(asc(users.email))

    return {
      ...result,
      courses: activeCourses,
      users: assignableUsers,
    }
  })
})

export const createTrainingCourseFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      title: z.string().trim().min(1).max(160),
      description: z.string().trim().max(2_000).optional(),
      frequencyDays: z.number().int().min(1).max(3650),
    }),
  )
  .handler(async ({ data }) => {
    const { db, access } = await requireProgramAccess()

    if (!canManageOrganization(access)) {
      throw new Error('Only administrators can manage training courses')
    }

    return runInAuditContext(access.userId, () =>
      createTrainingCourse(db, {
        tenantId: access.organizationId,
        actorId: access.userId,
        title: data.title,
        description: data.description || undefined,
        frequencyDays: data.frequencyDays,
      }),
    )
  })

export const deactivateTrainingCourseFn = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ courseId: z.string().uuid() }))
  .handler(async ({ data }) => {
    const { db, access } = await requireProgramAccess()

    if (!canManageOrganization(access)) {
      throw new Error('Only administrators can manage training courses')
    }

    return runInAuditContext(access.userId, () =>
      deactivateTrainingCourse(db, {
        tenantId: access.organizationId,
        actorId: access.userId,
        courseId: data.courseId,
      }),
    )
  })

export const assignCourseFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      userId: z.string().uuid(),
      courseId: z.string().uuid(),
      dueAt: z.string().datetime(),
    }),
  )
  .handler(async ({ data }) => {
    const { db, access } = await requireProgramAccess()

    if (!canManageOrganization(access)) {
      throw new Error('Only administrators can assign courses')
    }

    return runInAuditContext(access.userId, () =>
      assignCourse(db, {
        tenantId: access.organizationId,
        actorId: access.userId,
        userId: data.userId,
        courseId: data.courseId,
        dueAt: new Date(data.dueAt),
      }),
    )
  })

export const markTrainingCompletedFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      recordId: z.string().uuid(),
      certificateFileKey: z.string().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const { db, access } = await requireProgramAccess()

    if (!canWriteLocations(access)) {
      throw new Error('Access denied')
    }

    return runInAuditContext(access.userId, async () => {
      const [record] = await db
        .select({
          id: trainingRecords.id,
          userId: trainingRecords.userId,
        })
        .from(trainingRecords)
        .innerJoin(trainingCourses, eq(trainingRecords.courseId, trainingCourses.id))
        .where(
          and(
            eq(trainingRecords.id, data.recordId),
            eq(trainingCourses.tenantId, access.organizationId),
          ),
        )
        .limit(1)

      if (!record || (!canManageOrganization(access) && record.userId !== access.userId)) {
        throw new Error('Training record not found')
      }

      await assertTrainingRecordUserInOrganization(db, access.organizationId, record.userId)

      const certificateFileKey = data.certificateFileKey
        ? assertTrainingCertificateKey(
            access.organizationId,
            data.recordId,
            data.certificateFileKey,
          )
        : undefined

      const mockUploadsEnabled = isMockUploadsEnabled()
      let certificateBucket: string | null = null
      let certificateMetadata: {
        contentType: string
        sizeBytes: number
      } | null = null
      if (certificateFileKey && !mockUploadsEnabled) {
        certificateBucket = requireAttachmentsBucketName()
        certificateMetadata = await assertObjectExists({
          bucket: certificateBucket,
          key: certificateFileKey,
          maxBytes: MAX_UPLOAD_BYTES,
        })
      }

      if (certificateFileKey) {
        await recordEvidenceFileScanPending(db, {
          tenantId: access.organizationId,
          s3Key: certificateFileKey,
          uploadedBy: access.userId,
          avStatus: mockUploadsEnabled ? 'skipped' : 'pending',
        })

        if (!mockUploadsEnabled) {
          await dispatchAttachmentScanRequest({
            organizationId: access.organizationId,
            key: certificateFileKey,
            bucket: certificateBucket!,
            contentType: certificateMetadata!.contentType,
            sizeBytes: certificateMetadata!.sizeBytes,
          })
        }
      }

      return markCompleted(db, {
        recordId: data.recordId,
        actorId: access.userId,
        actorUserId: access.userId,
        actorCanManageAllUsers: canManageOrganization(access),
        tenantId: access.organizationId,
        certificateFileKey,
      })
    })
  })

export const presignTrainingCertificateUploadFn = createServerFn({
  method: 'POST',
})
  .inputValidator(
    z.object({
      recordId: z.string().uuid(),
      filename: z.string().trim().min(1).max(255),
      sizeBytes: z
        .number()
        .int()
        .positive()
        .max(MAX_UPLOAD_BYTES, { message: 'File exceeds 25 MB limit' }),
      contentType: z
        .string()
        .refine((contentType) => ALLOWED_UPLOAD_CONTENT_TYPES.has(contentType), {
          message: 'File type not allowed',
        }),
    }),
  )
  .handler(async ({ data }) => {
    const { db, access } = await requireProgramAccess()

    if (!canWriteLocations(access)) {
      throw new Error('Access denied')
    }

    const [record] = await db
      .select({
        id: trainingRecords.id,
        userId: trainingRecords.userId,
      })
      .from(trainingRecords)
      .innerJoin(trainingCourses, eq(trainingRecords.courseId, trainingCourses.id))
      .where(
        and(
          eq(trainingRecords.id, data.recordId),
          eq(trainingCourses.tenantId, access.organizationId),
        ),
      )
      .limit(1)

    if (!record || (!canManageOrganization(access) && record.userId !== access.userId)) {
      throw new Error('Training record not found')
    }

    await assertTrainingRecordUserInOrganization(db, access.organizationId, record.userId)

    const key = buildTrainingCertificateKey(access.organizationId, data.recordId, data.filename)
    assertTrainingCertificateKey(access.organizationId, data.recordId, key)

    if (isMockUploadsEnabled()) {
      return {
        uploadUrl: buildMockUploadUrl(key),
        key,
      }
    }

    const bucket = requireAttachmentsBucketName()
    const uploadUrl = await generatePresignedUploadUrl({
      bucket,
      key,
      organizationId: access.organizationId,
      contentType: data.contentType,
      sizeBytes: data.sizeBytes,
      expiresIn: 300,
    })

    return { uploadUrl, key }
  })

export const downloadTrainingCertificateFn = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ recordId: z.string().uuid() }))
  .handler(async ({ data }) => {
    const { db, access } = await requireProgramAccess()

    if (!canWriteLocations(access)) {
      throw new Error('Access denied')
    }

    const [record] = await db
      .select({
        id: trainingRecords.id,
        userId: trainingRecords.userId,
        certificateFileKey: trainingRecords.certificateFileKey,
      })
      .from(trainingRecords)
      .innerJoin(trainingCourses, eq(trainingRecords.courseId, trainingCourses.id))
      .where(
        and(
          eq(trainingRecords.id, data.recordId),
          eq(trainingCourses.tenantId, access.organizationId),
        ),
      )
      .limit(1)

    if (!record || (!canManageOrganization(access) && record.userId !== access.userId)) {
      throw new Error('Training record not found')
    }

    await assertTrainingRecordUserInOrganization(db, access.organizationId, record.userId)

    if (!record.certificateFileKey) {
      throw new Error('Training certificate not found')
    }

    assertTrainingCertificateKey(access.organizationId, data.recordId, record.certificateFileKey)

    const mockUploadsEnabled = isMockUploadsEnabled()
    const bucket = mockUploadsEnabled
      ? getEffectiveAttachmentsBucketName()
      : requireAttachmentsBucketName()
    if (!bucket) {
      throw new Error('Attachment storage is not configured')
    }

    if (mockUploadsEnabled) {
      return { downloadUrl: buildMockUploadUrl(record.certificateFileKey) }
    }

    await assertEvidenceFileScanClean(db, {
      tenantId: access.organizationId,
      s3Key: record.certificateFileKey,
    })

    const downloadUrl = await generatePresignedDownloadUrl({
      bucket,
      key: record.certificateFileKey,
      organizationId: access.organizationId,
      expiresIn: 900,
    })

    return { downloadUrl }
  })

// ---------------------------------------------------------------------------
// Risk
// ---------------------------------------------------------------------------

export const listRiskAssessmentsFn = createServerFn({ method: 'GET' }).handler(async () => {
  const { db, access } = await requireProgramAccess()

  return runInAuditContext(access.userId, async () => {
    const canAdmin = canManageOrganization(access)
    const assessments = await db
      .select()
      .from(riskAssessments)
      .where(eq(riskAssessments.tenantId, access.organizationId))

    const assessmentIds = assessments.map((a) => a.id)
    const allItems =
      assessmentIds.length > 0
        ? await db
            .select({
              id: riskItems.id,
              assessmentId: riskItems.assessmentId,
              category: riskItems.category,
              description: riskItems.description,
              likelihood: riskItems.likelihood,
              impact: riskItems.impact,
              score: riskItems.score,
              mitigation: riskItems.mitigation,
              ownerId: riskItems.ownerId,
              dueAt: riskItems.dueAt,
              status: riskItems.status,
              createdAt: riskItems.createdAt,
              updatedAt: riskItems.updatedAt,
            })
            .from(riskItems)
            .where(inArray(riskItems.assessmentId, assessmentIds))
        : []

    const itemsByAssessmentId = allItems.reduce((acc, item) => {
      const list = acc.get(item.assessmentId) ?? []
      list.push(item)
      acc.set(item.assessmentId, list)
      return acc
    }, new Map<string, typeof allItems>())

    const memberUsers = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
      })
      .from(memberships)
      .innerJoin(users, eq(memberships.userId, users.id))
      .where(eq(memberships.tenantId, access.organizationId))
      .orderBy(asc(users.email))

    const userById = new Map(memberUsers.map((user) => [user.id, user]))

    return {
      assessments: assessments.map((a) => {
        const items = itemsByAssessmentId.get(a.id) ?? []
        return {
          ...a,
          itemCount: items.length,
          summary: summarizeAssessment(items),
          items: items.map((item) => {
            const owner = item.ownerId ? userById.get(item.ownerId) : null
            return {
              ...item,
              ownerId: owner?.id ?? null,
              ownerName: owner?.name ?? null,
              ownerEmail: owner?.email ?? null,
            }
          }),
        }
      }),
      canAdmin,
      users: canAdmin ? memberUsers : [],
    }
  })
})

export const createRiskAssessmentFn = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ title: z.string().min(1).max(200) }))
  .handler(async ({ data }) => {
    const { db, access } = await requireProgramAccess()

    if (!canManageOrganization(access)) {
      throw new Error('Only administrators can create risk assessments')
    }

    return runInAuditContext(access.userId, async () => {
      return createRiskAssessment(db, {
        tenantId: access.organizationId,
        actorId: access.userId,
        title: data.title,
      })
    })
  })

export const createRiskItemFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      assessmentId: z.string().uuid(),
      category: z.string().trim().min(1).max(120),
      description: z.string().trim().min(1).max(2_000),
      likelihood: z.number().int().min(1).max(5),
      impact: z.number().int().min(1).max(5),
      mitigation: z.string().trim().max(2_000).optional(),
      ownerId: z.string().uuid().nullable().optional(),
      dueAt: optionalDateOnly,
    }),
  )
  .handler(async ({ data }) => {
    const { db, access } = await requireProgramAccess()

    if (!canManageOrganization(access)) {
      throw new Error('Only administrators can create risk items')
    }

    await assertRiskOwnerInOrganization(db, access.organizationId, data.ownerId)

    return runInAuditContext(access.userId, () =>
      createRiskItem(db, {
        tenantId: access.organizationId,
        actorId: access.userId,
        assessmentId: data.assessmentId,
        category: data.category,
        description: data.description,
        likelihood: data.likelihood,
        impact: data.impact,
        mitigation: data.mitigation,
        ownerId: data.ownerId ?? null,
        dueAt: data.dueAt ? new Date(`${data.dueAt}T00:00:00.000Z`) : undefined,
      }),
    )
  })

export const deleteRiskItemFn = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ itemId: z.string().uuid() }))
  .handler(async ({ data }) => {
    const { db, access } = await requireProgramAccess()

    if (!canManageOrganization(access)) {
      throw new Error('Only administrators can delete risk items')
    }

    return runInAuditContext(access.userId, () =>
      deleteRiskItem(db, {
        tenantId: access.organizationId,
        actorId: access.userId,
        itemId: data.itemId,
      }),
    )
  })

export const updateRiskItemFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      itemId: z.string().uuid(),
      category: z.string().trim().min(1).max(120),
      description: z.string().trim().min(1).max(2_000),
      likelihood: z.number().int().min(1).max(5),
      impact: z.number().int().min(1).max(5),
      mitigation: z.string().trim().max(2_000).optional(),
      ownerId: z.string().uuid().nullable().optional(),
      dueAt: optionalDateOnly.nullable(),
    }),
  )
  .handler(async ({ data }) => {
    const { db, access } = await requireProgramAccess()

    if (!canManageOrganization(access)) {
      throw new Error('Only administrators can update risk items')
    }

    await assertRiskOwnerInOrganization(db, access.organizationId, data.ownerId)

    return runInAuditContext(access.userId, () =>
      updateRiskItem(db, {
        tenantId: access.organizationId,
        actorId: access.userId,
        itemId: data.itemId,
        category: data.category,
        description: data.description,
        likelihood: data.likelihood,
        impact: data.impact,
        mitigation: data.mitigation,
        ownerId: data.ownerId ?? null,
        dueAt: data.dueAt ? new Date(`${data.dueAt}T00:00:00.000Z`) : null,
      }),
    )
  })

async function assertRiskOwnerInOrganization(
  db: ReturnType<typeof getDb>,
  organizationId: string,
  ownerId: string | null | undefined,
) {
  if (!ownerId) return

  const [membership] = await db
    .select({ id: memberships.id })
    .from(memberships)
    .where(and(eq(memberships.tenantId, organizationId), eq(memberships.userId, ownerId)))
    .limit(1)

  if (!membership) {
    throw new Error('Risk owner must be an organization member')
  }
}

async function assertTrainingRecordUserInOrganization(
  db: ReturnType<typeof getDb>,
  organizationId: string,
  userId: string,
) {
  const [membership] = await db
    .select({ id: memberships.id })
    .from(memberships)
    .where(and(eq(memberships.tenantId, organizationId), eq(memberships.userId, userId)))
    .limit(1)

  if (!membership) {
    throw new Error('Training record not found')
  }
}

export const updateRiskAssessmentStatusFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      assessmentId: z.string().uuid(),
      status: z.enum(['open', 'in_review', 'closed']),
    }),
  )
  .handler(async ({ data }) => {
    const { db, access } = await requireProgramAccess()

    if (!canManageOrganization(access)) {
      throw new Error('Only administrators can update risk assessments')
    }

    return runInAuditContext(access.userId, () =>
      updateRiskAssessmentStatus(db, {
        tenantId: access.organizationId,
        actorId: access.userId,
        assessmentId: data.assessmentId,
        status: data.status,
      }),
    )
  })

// ---------------------------------------------------------------------------
// Vendors
// ---------------------------------------------------------------------------

export const listVendorsFn = createServerFn({ method: 'GET' }).handler(async () => {
  const { db, access } = await requireProgramAccess()

  return runInAuditContext(access.userId, async () => {
    const rows = await db.select().from(vendors).where(eq(vendors.tenantId, access.organizationId))
    const vendorIds = rows.map((vendor) => vendor.id)
    const baaRows =
      vendorIds.length > 0
        ? await db
            .select({
              id: vendorBaas.id,
              vendorId: vendorBaas.vendorId,
              signedAt: vendorBaas.signedAt,
              expiresAt: vendorBaas.expiresAt,
              signerName: vendorBaas.signerName,
              signerEmail: vendorBaas.signerEmail,
              createdAt: vendorBaas.createdAt,
              updatedAt: vendorBaas.updatedAt,
              documentFileKey: vendorBaas.documentFileKey,
            })
            .from(vendorBaas)
            .where(inArray(vendorBaas.vendorId, vendorIds))
            .orderBy(desc(vendorBaas.signedAt), desc(vendorBaas.createdAt))
        : []

    const latestBaaByVendorId = new Map(
      selectLatestBaasByVendor(baaRows).map((baa) => [baa.vendorId, baa]),
    )

    return {
      vendors: rows.map((vendor) => ({
        ...vendor,
        latestBaa: (() => {
          const latestBaa = latestBaaByVendorId.get(vendor.id)
          if (!latestBaa) return null
          const { documentFileKey: _documentFileKey, ...safeBaa } = latestBaa
          return {
            ...safeBaa,
            hasEvidence: Boolean(latestBaa.documentFileKey),
            baaState: getVendorBaaState(latestBaa),
          }
        })(),
      })),
      canAdmin: canManageOrganization(access),
    }
  })
})

export const createVendorFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      name: z.string().min(1).max(200),
      website: z.string().url().optional(),
      contactEmail: z.string().email().optional(),
      dataCategories: z.array(z.string().max(80)).max(20).optional(),
    }),
  )
  .handler(async ({ data }) => {
    const { db, access } = await requireProgramAccess()

    if (!canManageOrganization(access)) {
      throw new Error('Only administrators can add vendors')
    }

    return runInAuditContext(access.userId, async () => {
      return createVendor(db, {
        tenantId: access.organizationId,
        actorId: access.userId,
        name: data.name,
        website: data.website,
        contactEmail: data.contactEmail,
        dataCategories: normalizeDataCategories(data.dataCategories),
        baaTaskLocationId: access.defaultLocationId ?? undefined,
      })
    })
  })

export const recordVendorBaaFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      vendorId: z.string().uuid(),
      signedAt: z.string().datetime(),
      signerName: z.string().min(1),
      signerEmail: z.string().email(),
      expiresAt: z.string().datetime().optional(),
      documentFileKey: z.string().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const { db, access } = await requireProgramAccess()

    if (!canManageOrganization(access)) {
      throw new Error('Only administrators can record BAAs')
    }

    return runInAuditContext(access.userId, async () => {
      const documentFileKey = data.documentFileKey
        ? assertVendorBaaDocumentKey(access.organizationId, data.vendorId, data.documentFileKey)
        : undefined

      const [vendor] = await db
        .select({ id: vendors.id })
        .from(vendors)
        .where(and(eq(vendors.id, data.vendorId), eq(vendors.tenantId, access.organizationId)))
        .limit(1)

      if (!vendor) {
        throw new Error('Vendor not found')
      }

      const mockUploadsEnabled = isMockUploadsEnabled()
      let documentBucket: string | null = null
      let documentMetadata: { contentType: string; sizeBytes: number } | null = null
      if (documentFileKey && !mockUploadsEnabled) {
        documentBucket = requireAttachmentsBucketName()
        documentMetadata = await assertObjectExists({
          bucket: documentBucket,
          key: documentFileKey,
          maxBytes: MAX_UPLOAD_BYTES,
        })
      }

      if (documentFileKey) {
        await recordEvidenceFileScanPending(db, {
          tenantId: access.organizationId,
          s3Key: documentFileKey,
          uploadedBy: access.userId,
          avStatus: mockUploadsEnabled ? 'skipped' : 'pending',
        })

        if (!mockUploadsEnabled) {
          await dispatchAttachmentScanRequest({
            organizationId: access.organizationId,
            key: documentFileKey,
            bucket: documentBucket!,
            contentType: documentMetadata!.contentType,
            sizeBytes: documentMetadata!.sizeBytes,
          })
        }
      }

      return recordBaa(db, {
        vendorId: data.vendorId,
        tenantId: access.organizationId,
        actorId: access.userId,
        signedAt: new Date(data.signedAt),
        signerName: data.signerName,
        signerEmail: data.signerEmail,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
        documentFileKey,
        renewalTaskLocationId: data.expiresAt ? (access.defaultLocationId ?? undefined) : undefined,
      })
    })
  })

export const presignVendorBaaUploadFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      vendorId: z.string().uuid(),
      filename: z.string().trim().min(1).max(255),
      sizeBytes: z
        .number()
        .int()
        .positive()
        .max(MAX_UPLOAD_BYTES, { message: 'File exceeds 25 MB limit' }),
      contentType: z
        .string()
        .refine((contentType) => ALLOWED_UPLOAD_CONTENT_TYPES.has(contentType), {
          message: 'File type not allowed',
        }),
    }),
  )
  .handler(async ({ data }) => {
    const { db, access } = await requireProgramAccess()

    if (!canManageOrganization(access)) {
      throw new Error('Only administrators can upload BAA evidence')
    }

    const [vendor] = await db
      .select({ id: vendors.id })
      .from(vendors)
      .where(and(eq(vendors.id, data.vendorId), eq(vendors.tenantId, access.organizationId)))
      .limit(1)

    if (!vendor) {
      throw new Error('Vendor not found')
    }

    const key = buildVendorBaaEvidenceKey(access.organizationId, data.vendorId, data.filename)
    assertVendorBaaDocumentKey(access.organizationId, data.vendorId, key)

    if (isMockUploadsEnabled()) {
      return {
        uploadUrl: buildMockUploadUrl(key),
        key,
      }
    }

    const bucket = requireAttachmentsBucketName()
    const uploadUrl = await generatePresignedUploadUrl({
      bucket,
      key,
      organizationId: access.organizationId,
      contentType: data.contentType,
      sizeBytes: data.sizeBytes,
      expiresIn: 300,
    })

    return { uploadUrl, key }
  })

export const downloadVendorBaaEvidenceFn = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ baaId: z.string().uuid() }))
  .handler(async ({ data }) => {
    const { db, access } = await requireProgramAccess()

    if (!canManageOrganization(access)) {
      throw new Error('Only administrators can download BAA evidence')
    }

    const [baa] = await db
      .select({
        id: vendorBaas.id,
        vendorId: vendorBaas.vendorId,
        documentFileKey: vendorBaas.documentFileKey,
      })
      .from(vendorBaas)
      .innerJoin(vendors, eq(vendorBaas.vendorId, vendors.id))
      .where(and(eq(vendorBaas.id, data.baaId), eq(vendors.tenantId, access.organizationId)))
      .limit(1)

    if (!baa?.documentFileKey) {
      throw new Error('BAA evidence not found')
    }

    assertVendorBaaDocumentKey(access.organizationId, baa.vendorId, baa.documentFileKey)

    const mockUploadsEnabled = isMockUploadsEnabled()
    const bucket = mockUploadsEnabled
      ? getEffectiveAttachmentsBucketName()
      : requireAttachmentsBucketName()
    if (!bucket) {
      throw new Error('Attachment storage is not configured')
    }

    if (mockUploadsEnabled) {
      return { downloadUrl: buildMockUploadUrl(baa.documentFileKey) }
    }

    await assertEvidenceFileScanClean(db, {
      tenantId: access.organizationId,
      s3Key: baa.documentFileKey,
    })

    const downloadUrl = await generatePresignedDownloadUrl({
      bucket,
      key: baa.documentFileKey,
      organizationId: access.organizationId,
      expiresIn: 900,
    })

    return { downloadUrl }
  })

export const markVendorInactiveFn = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ vendorId: z.string().uuid() }))
  .handler(async ({ data }) => {
    const { db, access } = await requireProgramAccess()

    if (!canManageOrganization(access)) {
      throw new Error('Only administrators can update vendor status')
    }

    return runInAuditContext(access.userId, () =>
      markVendorInactive(db, {
        vendorId: data.vendorId,
        tenantId: access.organizationId,
        actorId: access.userId,
      }),
    )
  })

export const updateVendorFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z
      .object({
        vendorId: z.string().uuid(),
        name: z.string().min(1).max(200).optional(),
        website: z.string().url().nullable().optional(),
        contactEmail: z.string().email().nullable().optional(),
        dataCategories: z.array(z.string().max(80)).max(20).optional(),
      })
      .refine(
        (value) =>
          value.name !== undefined ||
          value.website !== undefined ||
          value.contactEmail !== undefined ||
          value.dataCategories !== undefined,
        { message: 'At least one vendor field must be provided' },
      ),
  )
  .handler(async ({ data }) => {
    const { db, access } = await requireProgramAccess()

    if (!canManageOrganization(access)) {
      throw new Error('Only administrators can update vendors')
    }

    return runInAuditContext(access.userId, () =>
      updateVendor(db, {
        vendorId: data.vendorId,
        tenantId: access.organizationId,
        actorId: access.userId,
        name: data.name,
        website: data.website,
        contactEmail: data.contactEmail,
        dataCategories: data.dataCategories
          ? normalizeDataCategories(data.dataCategories)
          : undefined,
      }),
    )
  })

export const reactivateVendorFn = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ vendorId: z.string().uuid() }))
  .handler(async ({ data }) => {
    const { db, access } = await requireProgramAccess()

    if (!canManageOrganization(access)) {
      throw new Error('Only administrators can reactivate vendors')
    }

    return runInAuditContext(access.userId, () =>
      reactivateVendor(db, {
        vendorId: data.vendorId,
        tenantId: access.organizationId,
        actorId: access.userId,
      }),
    )
  })

export const listVendorBaasFn = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ vendorId: z.string().uuid() }))
  .handler(async ({ data }) => {
    const { db, access } = await requireProgramAccess()

    if (!canManageOrganization(access)) {
      throw new Error('Only administrators can view BAA history')
    }

    return runInAuditContext(access.userId, () =>
      listVendorBaas(db, {
        vendorId: data.vendorId,
        tenantId: access.organizationId,
      }),
    )
  })

export const updateLatestVendorBaaFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z
      .object({
        vendorId: z.string().uuid(),
        signerName: z.string().min(1).optional(),
        signerEmail: z.string().email().optional(),
        signedAt: z.string().datetime().optional(),
        expiresAt: z.string().datetime().nullable().optional(),
      })
      .refine(
        (value) =>
          value.signerName !== undefined ||
          value.signerEmail !== undefined ||
          value.signedAt !== undefined ||
          value.expiresAt !== undefined,
        { message: 'At least one BAA field must be provided' },
      ),
  )
  .handler(async ({ data }) => {
    const { db, access } = await requireProgramAccess()

    if (!canManageOrganization(access)) {
      throw new Error('Only administrators can update BAA metadata')
    }

    return runInAuditContext(access.userId, () =>
      updateLatestVendorBaa(db, {
        vendorId: data.vendorId,
        tenantId: access.organizationId,
        actorId: access.userId,
        signerName: data.signerName,
        signerEmail: data.signerEmail,
        signedAt: data.signedAt ? new Date(data.signedAt) : undefined,
        expiresAt:
          data.expiresAt !== undefined
            ? data.expiresAt
              ? new Date(data.expiresAt)
              : null
            : undefined,
      }),
    )
  })

// ---------------------------------------------------------------------------
// Training - additional mutations
// ---------------------------------------------------------------------------

export const unassignTrainingFn = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ recordId: z.string().uuid() }))
  .handler(async ({ data }) => {
    const { db, access } = await requireProgramAccess()

    if (!canManageOrganization(access)) {
      throw new Error('Only administrators can unassign training records')
    }

    return runInAuditContext(access.userId, () =>
      unassignTraining(db, {
        recordId: data.recordId,
        tenantId: access.organizationId,
        actorId: access.userId,
      }),
    )
  })

export const reassignTrainingFn = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ recordId: z.string().uuid(), userId: z.string().uuid() }))
  .handler(async ({ data }) => {
    const { db, access } = await requireProgramAccess()

    if (!canManageOrganization(access)) {
      throw new Error('Only administrators can reassign training records')
    }

    return runInAuditContext(access.userId, () =>
      reassignTraining(db, {
        recordId: data.recordId,
        tenantId: access.organizationId,
        actorId: access.userId,
        newUserId: data.userId,
      }),
    )
  })

export const updateTrainingDueDateFn = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ recordId: z.string().uuid(), dueAt: z.string().datetime() }))
  .handler(async ({ data }) => {
    const { db, access } = await requireProgramAccess()

    if (!canManageOrganization(access)) {
      throw new Error('Only administrators can update training due dates')
    }

    return runInAuditContext(access.userId, () =>
      updateTrainingDueDate(db, {
        recordId: data.recordId,
        tenantId: access.organizationId,
        actorId: access.userId,
        dueAt: new Date(data.dueAt),
      }),
    )
  })

export const reactivateTrainingCourseFn = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ courseId: z.string().uuid() }))
  .handler(async ({ data }) => {
    const { db, access } = await requireProgramAccess()

    if (!canManageOrganization(access)) {
      throw new Error('Only administrators can reactivate training courses')
    }

    return runInAuditContext(access.userId, () =>
      reactivateTrainingCourse(db, {
        courseId: data.courseId,
        tenantId: access.organizationId,
        actorId: access.userId,
      }),
    )
  })

export const reopenTrainingCompletionFn = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ recordId: z.string().uuid() }))
  .handler(async ({ data }) => {
    const { db, access } = await requireProgramAccess()

    if (!canManageOrganization(access)) {
      throw new Error('Only administrators can reopen training completions')
    }

    return runInAuditContext(access.userId, () =>
      reopenTrainingCompletion(db, {
        recordId: data.recordId,
        tenantId: access.organizationId,
        actorId: access.userId,
      }),
    )
  })

// ---------------------------------------------------------------------------
// Risk - additional mutations
// ---------------------------------------------------------------------------

export const reopenRiskAssessmentFn = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ assessmentId: z.string().uuid() }))
  .handler(async ({ data }) => {
    const { db, access } = await requireProgramAccess()

    if (!canManageOrganization(access)) {
      throw new Error('Only administrators can reopen risk assessments')
    }

    return runInAuditContext(access.userId, () =>
      reopenRiskAssessment(db, {
        assessmentId: data.assessmentId,
        tenantId: access.organizationId,
        actorId: access.userId,
      }),
    )
  })

export const renameRiskAssessmentFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      assessmentId: z.string().uuid(),
      title: z.string().min(1).max(200),
    }),
  )
  .handler(async ({ data }) => {
    const { db, access } = await requireProgramAccess()

    if (!canManageOrganization(access)) {
      throw new Error('Only administrators can rename risk assessments')
    }

    return runInAuditContext(access.userId, () =>
      renameRiskAssessment(db, {
        assessmentId: data.assessmentId,
        tenantId: access.organizationId,
        actorId: access.userId,
        title: data.title,
      }),
    )
  })

export const deleteRiskAssessmentFn = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ assessmentId: z.string().uuid() }))
  .handler(async ({ data }) => {
    const { db, access } = await requireProgramAccess()

    if (!canManageOrganization(access)) {
      throw new Error('Only administrators can delete risk assessments')
    }

    return runInAuditContext(access.userId, () =>
      deleteRiskAssessment(db, {
        assessmentId: data.assessmentId,
        tenantId: access.organizationId,
        actorId: access.userId,
      }),
    )
  })
