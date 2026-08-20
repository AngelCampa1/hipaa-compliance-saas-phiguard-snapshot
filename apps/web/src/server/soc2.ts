import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { and, count, eq, inArray } from 'drizzle-orm'
import {
  getDb,
  organizations,
  soc2Evidence,
  accessReviews,
  accessReviewItems,
  evidenceFileScans,
  memberships,
  users,
} from '@phiguard/db/server'
import { recordFeatureUsage, requireFeatureForOrg } from '@phiguard/billing'
import {
  listControls,
  collectAuditEvidence,
  CONTROL_AUDIT_MAP,
  exportEvidenceBundle,
  getManualEvidenceFileKeyPrefix,
  recordManualEvidence,
  validateManualEvidenceFileKey,
  openAccessReview,
  recordDecision,
  closeAccessReview,
} from '@phiguard/compliance'
import { getAuditExportsBucketBinding } from '@phiguard/audit'
import { canAccessSoc2 } from '@phiguard/auth'
import { runInAuditContext } from '../lib/audit.server.js'
import { dispatchAttachmentScanRequest } from '../lib/attachment-scan.js'
import {
  assertEvidenceFileScanClean,
  recordEvidenceFileScanPending,
} from '../lib/evidence-file-scan.js'
import { applyObjectStorageHttpMetadata } from '../lib/object-storage.js'
import {
  ALLOWED_UPLOAD_CONTENT_TYPES,
  MAX_UPLOAD_BYTES,
  assertObjectExists,
  buildMockUploadUrl,
  buildSoc2BundleDownloadUrl,
  buildSoc2EvidenceKey,
  generatePresignedDownloadUrl,
  generatePresignedUploadUrl,
  isMockUploadsEnabled,
  requireAttachmentsBucketName,
} from '../lib/s3.js'
import { getSessionFn } from '../lib/session.js'
import {
  assertCommercialProductAccess,
  canManageOrganization,
  resolveActiveLocationAccess,
} from './access.js'

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue }

function sanitizeAttachmentFilename(filename: string) {
  const sanitized = filename.replace(/[\x00-\x1F\x7F"\\]/g, '_')
  return sanitized || 'evidence-bundle.json'
}

async function requireSoc2Access() {
  const session = await getSessionFn()
  if (!session?.user?.id || !session.session.activeOrganizationId) {
    throw new Error('Unauthorized')
  }

  const db = getDb()
  const access = await resolveActiveLocationAccess(db, session)
  assertCommercialProductAccess(access)

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

  requireFeatureForOrg(org, 'soc2_evidence')
  if (org.planStatus === 'trialing') {
    void recordFeatureUsage(db, access.organizationId, 'soc2_evidence').catch(() => {
      // best-effort
    })
  }

  if (!canAccessSoc2(access.role)) {
    throw new Error('Access denied: SOC 2 is restricted to administrators and auditors')
  }

  return { db, access, plan: org.plan }
}

// ---------------------------------------------------------------------------
// Controls
// ---------------------------------------------------------------------------

export const listControlsFn = createServerFn({ method: 'GET' }).handler(async () => {
  const { db, access } = await requireSoc2Access()

  return runInAuditContext(access.userId, async () => {
    const tenantId = access.organizationId

    const controls = await listControls(db, { tenantId })

    // Count evidence per control
    const evidenceCounts = await db
      .select({ controlId: soc2Evidence.controlId, count: count() })
      .from(soc2Evidence)
      .where(eq(soc2Evidence.tenantId, tenantId))
      .groupBy(soc2Evidence.controlId)

    const countByControlId = new Map(evidenceCounts.map((e) => [e.controlId, e.count]))

    return controls.map((ctrl) => ({
      ...ctrl,
      evidenceCount: countByControlId.get(ctrl.controlId) ?? 0,
      hasAuditEvidenceMapping: Object.hasOwn(CONTROL_AUDIT_MAP, ctrl.controlId),
    }))
  })
})

// ---------------------------------------------------------------------------
// Evidence
// ---------------------------------------------------------------------------

export const listEvidenceFn = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ controlId: z.string().optional() }))
  .handler(async ({ data }) => {
    const { db, access } = await requireSoc2Access()

    return runInAuditContext(access.userId, async () => {
      const conditions: ReturnType<typeof eq>[] = [eq(soc2Evidence.tenantId, access.organizationId)]
      if (data.controlId) {
        const controls = await listControls(db, { tenantId: access.organizationId })
        if (!controls.some((control) => control.controlId === data.controlId)) {
          return {
            evidence: [],
            canAdmin: canManageOrganization(access),
          }
        }
        conditions.push(eq(soc2Evidence.controlId, data.controlId))
      }

      const rows = await db
        .select()
        .from(soc2Evidence)
        .where(and(...conditions))

      const artifactKeys = rows
        .map((row) => row.fileKey)
        .filter((fileKey): fileKey is string => Boolean(fileKey))
      const scanRows =
        artifactKeys.length > 0
          ? await db
              .select({
                s3Key: evidenceFileScans.s3Key,
                avStatus: evidenceFileScans.avStatus,
              })
              .from(evidenceFileScans)
              .where(
                and(
                  eq(evidenceFileScans.tenantId, access.organizationId),
                  inArray(evidenceFileScans.s3Key, artifactKeys),
                ),
              )
          : []
      const scanStatusByKey = new Map(scanRows.map((scan) => [scan.s3Key, scan.avStatus]))

      return {
        evidence: rows.map((row) => {
          const { fileKey: _fileKey, ...safeRow } = row
          const artifactScanStatus = row.fileKey
            ? row.fileKey.startsWith(getManualEvidenceFileKeyPrefix(access.organizationId))
              ? (scanStatusByKey.get(row.fileKey) ?? 'pending')
              : 'invalid'
            : null
          return {
            ...safeRow,
            artifactScanStatus,
            hasArtifact:
              Boolean(row.fileKey) &&
              (artifactScanStatus === 'clean' || artifactScanStatus === 'skipped'),
            collectedAt: row.collectedAt.toISOString(),
            createdAt: row.createdAt.toISOString(),
            updatedAt: row.updatedAt.toISOString(),
            metadata: (row.metadata ?? null) as JsonValue,
          }
        }),
        canAdmin: canManageOrganization(access),
      }
    })
  })

export const exportEvidenceBundleFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      from: z.string().datetime(),
      to: z.string().datetime(),
    }),
  )
  .handler(async ({ data }) => {
    const { db, access } = await requireSoc2Access()

    if (!canManageOrganization(access)) {
      throw new Error('Only administrators can export evidence bundles')
    }

    return runInAuditContext(access.userId, async () => {
      const result = await exportEvidenceBundle(db, {
        tenantId: access.organizationId,
        actorId: access.userId,
        from: new Date(data.from),
        to: new Date(data.to),
      })

      return {
        ...result,
        downloadUrl: buildSoc2BundleDownloadUrl(result.key),
      }
    })
  })

export const collectAuditEvidenceFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      controlId: z.string().trim().min(1),
      from: z.string().datetime(),
      to: z.string().datetime(),
    }),
  )
  .handler(async ({ data }) => {
    const { db, access } = await requireSoc2Access()

    if (!canManageOrganization(access)) {
      throw new Error('Only administrators can collect audit evidence')
    }

    if (!Object.hasOwn(CONTROL_AUDIT_MAP, data.controlId)) {
      throw new Error('SOC 2 control does not have audit evidence mapping')
    }

    const actionFilters = CONTROL_AUDIT_MAP[data.controlId]

    return runInAuditContext(access.userId, () =>
      collectAuditEvidence(db, {
        tenantId: access.organizationId,
        controlId: data.controlId,
        actionFilters,
        from: new Date(data.from),
        to: new Date(data.to),
      }),
    )
  })

export const recordManualEvidenceFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      controlId: z.string().trim().min(1),
      fileKey: z.string().trim().min(1),
      summary: z.string().trim().min(1),
    }),
  )
  .handler(async ({ data }) => {
    const { db, access } = await requireSoc2Access()

    if (!canManageOrganization(access)) {
      throw new Error('Only administrators can record evidence')
    }

    return runInAuditContext(access.userId, () =>
      (async () => {
        const fileKey = validateManualEvidenceFileKey(data.fileKey, access.organizationId)
        const controls = await listControls(db, { tenantId: access.organizationId })
        if (!controls.some((control) => control.controlId === data.controlId.trim())) {
          throw new Error('SOC 2 control not found')
        }

        const mockUploadsEnabled = isMockUploadsEnabled()
        let bucket: string | null = null
        let objectMetadata: { contentType: string; sizeBytes: number } | null = null

        if (!mockUploadsEnabled) {
          bucket = requireAttachmentsBucketName()
          objectMetadata = await assertObjectExists({
            bucket,
            key: fileKey,
            maxBytes: MAX_UPLOAD_BYTES,
          })
        }

        await recordEvidenceFileScanPending(db, {
          tenantId: access.organizationId,
          s3Key: fileKey,
          uploadedBy: access.userId,
          avStatus: mockUploadsEnabled ? 'skipped' : 'pending',
        })

        if (!mockUploadsEnabled) {
          await dispatchAttachmentScanRequest({
            organizationId: access.organizationId,
            key: fileKey,
            bucket: bucket!,
            contentType: objectMetadata!.contentType,
            sizeBytes: objectMetadata!.sizeBytes,
          })
        }

        return recordManualEvidence(db, {
          tenantId: access.organizationId,
          actorId: access.userId,
          controlId: data.controlId,
          fileKey,
          summary: data.summary,
        })
      })(),
    )
  })

export const downloadSoc2EvidenceFn = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ evidenceId: z.string().uuid() }))
  .handler(async ({ data }) => {
    const { db, access } = await requireSoc2Access()

    const [evidence] = await db
      .select({
        id: soc2Evidence.id,
        fileKey: soc2Evidence.fileKey,
      })
      .from(soc2Evidence)
      .where(
        and(eq(soc2Evidence.id, data.evidenceId), eq(soc2Evidence.tenantId, access.organizationId)),
      )
      .limit(1)

    if (!evidence?.fileKey) {
      throw new Error('SOC 2 evidence artifact not found')
    }

    let fileKey: string
    try {
      fileKey = validateManualEvidenceFileKey(evidence.fileKey, access.organizationId)
    } catch {
      throw new Error('Invalid SOC 2 evidence key')
    }

    if (isMockUploadsEnabled()) {
      return { downloadUrl: buildMockUploadUrl(fileKey) }
    }

    const bucket = requireAttachmentsBucketName()
    await assertEvidenceFileScanClean(db, {
      tenantId: access.organizationId,
      s3Key: fileKey,
    })

    const downloadUrl = await generatePresignedDownloadUrl({
      bucket,
      key: fileKey,
      organizationId: access.organizationId,
      expiresIn: 900,
    })

    return { downloadUrl }
  })

export const presignSoc2EvidenceUploadFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
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
    const { access } = await requireSoc2Access()

    if (!canManageOrganization(access)) {
      throw new Error('Only administrators can upload evidence')
    }

    const key = buildSoc2EvidenceKey(access.organizationId, data.filename)
    validateManualEvidenceFileKey(key, access.organizationId)

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

export async function createEvidenceBundleDownloadResponse(request: Request): Promise<Response> {
  const url = new URL(request.url)
  const key = url.searchParams.get('key')?.trim() ?? ''
  const { access } = await requireSoc2Access()

  if (!canManageOrganization(access)) {
    throw new Error('Only administrators can download evidence bundles')
  }

  if (!key.startsWith(`soc2-bundles/${access.organizationId}/`)) {
    return new Response('Not Found', { status: 404 })
  }

  const bucket = getAuditExportsBucketBinding()
  if (!bucket) {
    throw new Error('Audit exports bucket binding is not configured')
  }

  const object = await bucket.get(key)
  if (!object?.body) {
    return new Response('Not Found', { status: 404 })
  }

  const filename = sanitizeAttachmentFilename(key.split('/').at(-1) ?? 'evidence-bundle.json')
  const headers = new Headers()
  applyObjectStorageHttpMetadata(headers, object)
  headers.set('Content-Type', headers.get('Content-Type') ?? 'application/json')
  headers.set('Content-Disposition', `attachment; filename="${filename}"`)
  headers.set('Cache-Control', 'private, no-store')

  return new Response(object.body, {
    status: 200,
    headers,
  })
}

// ---------------------------------------------------------------------------
// Access Reviews
// ---------------------------------------------------------------------------

export const listAccessReviewsFn = createServerFn({ method: 'GET' }).handler(async () => {
  const { db, access } = await requireSoc2Access()

  return runInAuditContext(access.userId, async () => {
    const reviews = await db
      .select()
      .from(accessReviews)
      .where(eq(accessReviews.tenantId, access.organizationId))
    return { reviews, canAdmin: canManageOrganization(access) }
  })
})

export const openAccessReviewFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      periodStart: z.string().datetime(),
      periodEnd: z.string().datetime(),
    }),
  )
  .handler(async ({ data }) => {
    const { db, access } = await requireSoc2Access()

    if (!canManageOrganization(access)) {
      throw new Error('Only administrators can open access reviews')
    }

    return runInAuditContext(access.userId, () =>
      openAccessReview(db, {
        tenantId: access.organizationId,
        actorId: access.userId,
        periodStart: new Date(data.periodStart),
        periodEnd: new Date(data.periodEnd),
      }),
    )
  })

export const recordDecisionFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z
      .object({
        reviewId: z.string().uuid(),
        itemId: z.string().uuid(),
        decision: z.enum(['keep', 'revoke', 'change_role']),
        targetRole: z
          .enum(['org_admin', 'auditor', 'location_manager', 'location_staff'])
          .optional(),
        notes: z.string().optional(),
      })
      .refine((data) => data.decision !== 'change_role' || data.targetRole, {
        path: ['targetRole'],
        message: 'Target role is required for access review role changes',
      })
      .refine((data) => data.decision === 'keep' || Boolean(data.notes?.trim()), {
        path: ['notes'],
        message: 'Reviewer notes are required for revoke and role-change decisions',
      }),
  )
  .handler(async ({ data }) => {
    const { db, access } = await requireSoc2Access()

    if (!canManageOrganization(access)) {
      throw new Error('Only administrators can record access review decisions')
    }

    return runInAuditContext(access.userId, () =>
      recordDecision(db, {
        reviewId: data.reviewId,
        itemId: data.itemId,
        decision: data.decision,
        targetRole: data.targetRole,
        notes: data.notes ?? '',
        actorId: access.userId,
        tenantId: access.organizationId,
      }),
    )
  })

export const listAccessReviewItemsFn = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ reviewId: z.string().uuid() }))
  .handler(async ({ data }) => {
    const { db, access } = await requireSoc2Access()

    return runInAuditContext(access.userId, async () => {
      const [review] = await db
        .select({ id: accessReviews.id })
        .from(accessReviews)
        .where(
          and(
            eq(accessReviews.id, data.reviewId),
            eq(accessReviews.tenantId, access.organizationId),
          ),
        )
        .limit(1)

      if (!review) {
        throw new Error('Access review not found')
      }

      const items = await db
        .select({
          id: accessReviewItems.id,
          reviewId: accessReviewItems.reviewId,
          membershipId: accessReviewItems.membershipId,
          decision: accessReviewItems.decision,
          notes: accessReviewItems.notes,
          decidedAt: accessReviewItems.decidedAt,
          createdAt: accessReviewItems.createdAt,
          // Join membership role
          memberRole: memberships.role,
          memberUserId: memberships.userId,
          memberName: users.name,
          memberEmail: users.email,
        })
        .from(accessReviewItems)
        .leftJoin(
          memberships,
          and(
            eq(accessReviewItems.membershipId, memberships.id),
            eq(memberships.tenantId, access.organizationId),
          ),
        )
        .leftJoin(users, eq(memberships.userId, users.id))
        .where(eq(accessReviewItems.reviewId, review.id))

      return { items, canAdmin: canManageOrganization(access) }
    })
  })

export const closeAccessReviewFn = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ reviewId: z.string().uuid() }))
  .handler(async ({ data }) => {
    const { db, access } = await requireSoc2Access()

    if (!canManageOrganization(access)) {
      throw new Error('Only administrators can close access reviews')
    }

    return runInAuditContext(access.userId, () =>
      closeAccessReview(db, {
        reviewId: data.reviewId,
        actorId: access.userId,
        tenantId: access.organizationId,
      }),
    )
  })
