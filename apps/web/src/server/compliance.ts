import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { eq, and, desc, inArray } from 'drizzle-orm'
import { evidenceFileScans, getDb, memberships } from '@phiguard/db/server'
import {
  STARTER_TEMPLATES,
  assignChecklistTemplateToLocations,
  attachEvidence,
  assignPolicyToLocations,
  checklists,
  checklistItems,
  completePolicyAssignment,
  policies,
  policyAssignments,
  incidents,
  computeProgress,
  completeItem,
  listPolicyAssignments,
  reopenItem,
  reopenPolicyAssignment,
  runSeed,
  createIncident,
  transitionIncident,
  updateIncident,
  appendIncidentUpdate,
  listIncidentUpdates,
  archiveChecklist,
  renameChecklist,
  deleteChecklist,
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
  assertUploadedObject,
  buildChecklistEvidenceKey,
  buildMockUploadUrl,
  getEffectiveAttachmentsBucketName,
  generatePresignedDownloadUrl,
  generatePresignedUploadUrl,
  requireAttachmentsBucketName,
  isMockUploadsEnabled,
} from '../lib/s3.js'
import {
  assertCommercialProductAccess,
  canManageOrganization,
  canWriteLocations,
  getReadLocationIds,
  getWriteLocationId,
  resolveActiveLocationAccess,
} from './access.js'

function requireReadableLocationIds(locationIds: string[], notFoundMessage: string) {
  if (locationIds.length === 0) {
    throw new Error(notFoundMessage)
  }

  return locationIds
}

function isEmptyLocationScope(locationIds: string[]) {
  return locationIds.length === 0
}

function parseS3Uri(value: string) {
  if (!value.startsWith('storage://')) {
    return null
  }

  const path = value.slice('storage://'.length)
  const separatorIndex = path.indexOf('/')
  if (separatorIndex <= 0 || separatorIndex === path.length - 1) {
    return null
  }

  return {
    bucket: path.slice(0, separatorIndex),
    key: path.slice(separatorIndex + 1),
  }
}

async function withEvidenceScanStatus<T extends { evidence: string | null }>(
  db: ReturnType<typeof getDb>,
  tenantId: string,
  items: T[],
) {
  const keys = items
    .map((item) => (item.evidence ? parseS3Uri(item.evidence)?.key : null))
    .filter((key): key is string => Boolean(key))

  if (keys.length === 0) {
    return items.map((item) => ({ ...item, evidenceScanStatus: null }))
  }

  const scans = await db
    .select({
      s3Key: evidenceFileScans.s3Key,
      avStatus: evidenceFileScans.avStatus,
    })
    .from(evidenceFileScans)
    .where(and(eq(evidenceFileScans.tenantId, tenantId), inArray(evidenceFileScans.s3Key, keys)))
  const statusByKey = new Map(scans.map((scan) => [scan.s3Key, scan.avStatus]))

  return items.map((item) => {
    const key = item.evidence ? parseS3Uri(item.evidence)?.key : null
    return {
      ...item,
      evidenceScanStatus: key ? (statusByKey.get(key) ?? null) : null,
    }
  })
}

function assertChecklistEvidenceKey(tenantId: string, itemId: string, key: string) {
  const expectedPrefix = `evidence/${tenantId}/checklist-items/${itemId}/`
  if (!key.startsWith(expectedPrefix)) {
    throw new Error('Invalid evidence key')
  }
}

async function requireComplianceAccess() {
  const session = await getSessionFn()
  if (!session) throw new Error('Unauthorized')

  const db = getDb()
  const access = await resolveActiveLocationAccess(db, session)
  assertCommercialProductAccess(access)

  return { db, access }
}

async function requireOrgWideComplianceAccess() {
  const { db, access } = await requireComplianceAccess()

  if (!canManageOrganization(access)) {
    throw new Error('Only organization administrators can manage cross-location compliance')
  }

  return { db, access }
}

async function requireScopedChecklistItem(itemId: string, mode: 'read' | 'write' = 'read') {
  const { db, access } = await requireComplianceAccess()
  const locationIds = requireReadableLocationIds(
    getReadLocationIds(access),
    'Checklist item not found',
  )
  const [item] = await db
    .select()
    .from(checklistItems)
    .where(
      and(
        eq(checklistItems.id, itemId),
        eq(checklistItems.tenantId, access.organizationId),
        inArray(checklistItems.locationId, locationIds),
      ),
    )
    .limit(1)

  if (!item) {
    throw new Error('Checklist item not found')
  }

  if (mode === 'write') {
    getWriteLocationId(access, item.locationId)
  }

  return { db, access, item }
}

async function assertIncidentDiscovererBelongsToOrganization(
  db: ReturnType<typeof getDb>,
  tenantId: string,
  discoveredBy?: string,
) {
  if (!discoveredBy) return

  const [membership] = await db
    .select({ id: memberships.id })
    .from(memberships)
    .where(and(eq(memberships.tenantId, tenantId), eq(memberships.userId, discoveredBy)))
    .limit(1)

  if (!membership) {
    throw new Error('Incident discoverer must belong to this organization')
  }
}

export function buildComplianceScope(
  access: Awaited<ReturnType<typeof resolveActiveLocationAccess>>,
) {
  return {
    locations: access.locations.map((location) => ({
      id: location.id,
      name: location.name,
    })),
    defaultLocationId: access.defaultLocationId,
    canAccessAllLocations: access.canAccessAllLocations,
    canWrite: canWriteLocations(access),
    canAdmin: canManageOrganization(access),
  }
}

export const getComplianceScopeFn = createServerFn({ method: 'GET' }).handler(async () => {
  const { access } = await requireComplianceAccess()

  return buildComplianceScope(access)
})

// ---------------------------------------------------------------------------
// Checklists
// ---------------------------------------------------------------------------

export const listChecklistsFn = createServerFn({ method: 'GET' })
  .inputValidator(
    z
      .object({
        locationId: z.string().uuid().optional(),
      })
      .optional(),
  )
  .handler(async ({ data }) => {
    const { db, access } = await requireComplianceAccess()
    const locationIds = getReadLocationIds(access, data?.locationId)

    if (isEmptyLocationScope(locationIds)) {
      return []
    }

    return runInAuditContext(access.userId, async () => {
      const rows = await db
        .select()
        .from(checklists)
        .where(
          and(
            eq(checklists.tenantId, access.organizationId),
            inArray(checklists.locationId, locationIds),
          ),
        )
        .orderBy(desc(checklists.createdAt))

      return rows
    })
  })

export const listChecklistTemplatesFn = createServerFn({
  method: 'GET',
}).handler(async () => {
  const { db, access } = await requireComplianceAccess()

  return runInAuditContext(access.userId, async () => {
    await runSeed(db)

    return STARTER_TEMPLATES.map((template) => ({
      id: template.id,
      name: template.name,
      description: template.description,
      hipaaReference: template.hipaaReference,
      itemCount: template.items.length,
    }))
  })
})

const AssignChecklistTemplateInput = z.object({
  templateId: z.string().uuid(),
  locationIds: z.array(z.string().uuid()).min(1),
  dueAt: z.string().datetime().optional(),
})

export const assignChecklistTemplateFn = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => AssignChecklistTemplateInput.parse(data))
  .handler(async ({ data }) => {
    const input = AssignChecklistTemplateInput.parse(data)
    const { db, access } = await requireOrgWideComplianceAccess()
    await runSeed(db)

    for (const locationId of input.locationIds) {
      getWriteLocationId(access, locationId)
    }

    return runInAuditContext(access.userId, () =>
      assignChecklistTemplateToLocations(db, {
        tenantId: access.organizationId,
        templateId: input.templateId,
        locationIds: input.locationIds,
        actorId: access.userId,
        dueAt: input.dueAt ? new Date(input.dueAt) : undefined,
      }),
    )
  })

export const getChecklistFn = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ checklistId: z.string().uuid() }))
  .handler(async ({ data }) => {
    const { db, access } = await requireComplianceAccess()
    const locationIds = requireReadableLocationIds(
      getReadLocationIds(access),
      'Checklist not found',
    )

    return runInAuditContext(access.userId, async () => {
      const [checklist] = await db
        .select()
        .from(checklists)
        .where(
          and(
            eq(checklists.id, data.checklistId),
            eq(checklists.tenantId, access.organizationId),
            inArray(checklists.locationId, locationIds),
          ),
        )

      if (!checklist) throw new Error('Checklist not found')

      const items = await db
        .select()
        .from(checklistItems)
        .where(
          and(
            eq(checklistItems.checklistId, data.checklistId),
            eq(checklistItems.tenantId, access.organizationId),
            inArray(checklistItems.locationId, locationIds),
          ),
        )

      const itemsWithScanStatus = await withEvidenceScanStatus(db, access.organizationId, items)
      const progress = computeProgress(items)

      return { checklist, items: itemsWithScanStatus, progress }
    })
  })

export const completeItemFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      itemId: z.string().uuid(),
    }),
  )
  .handler(async ({ data }) => {
    const { db, access } = await requireScopedChecklistItem(data.itemId, 'write')

    return runInAuditContext(access.userId, () =>
      completeItem(db, {
        itemId: data.itemId,
        tenantId: access.organizationId,
        actorId: access.userId,
      }),
    )
  })

export const reopenItemFn = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ itemId: z.string().uuid() }))
  .handler(async ({ data }) => {
    const { db, access } = await requireScopedChecklistItem(data.itemId, 'write')

    return runInAuditContext(access.userId, () =>
      reopenItem(db, {
        itemId: data.itemId,
        tenantId: access.organizationId,
        actorId: access.userId,
      }),
    )
  })

export const presignChecklistEvidenceUploadFn = createServerFn({
  method: 'POST',
})
  .inputValidator(
    z.object({
      itemId: z.string().uuid(),
      filename: z.string().min(1).max(255),
      contentType: z.string().refine((t) => ALLOWED_UPLOAD_CONTENT_TYPES.has(t), {
        message: 'File type not allowed',
      }),
      sizeBytes: z
        .number()
        .int()
        .positive()
        .max(MAX_UPLOAD_BYTES, { message: 'File exceeds 25 MB limit' }),
    }),
  )
  .handler(async ({ data }) => {
    const { access } = await requireScopedChecklistItem(data.itemId, 'write')
    const key = buildChecklistEvidenceKey(access.organizationId, data.itemId, data.filename)

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

export const completeChecklistEvidenceUploadFn = createServerFn({
  method: 'POST',
})
  .inputValidator(
    z.object({
      itemId: z.string().uuid(),
      s3Key: z.string().min(1),
      contentType: z.string().refine((t) => ALLOWED_UPLOAD_CONTENT_TYPES.has(t), {
        message: 'File type not allowed',
      }),
      sizeBytes: z
        .number()
        .int()
        .positive()
        .max(MAX_UPLOAD_BYTES, { message: 'File exceeds 25 MB limit' }),
    }),
  )
  .handler(async ({ data }) => {
    const { db, access } = await requireScopedChecklistItem(data.itemId, 'write')
    const mockUploadsEnabled = isMockUploadsEnabled()
    let bucket: string | null = null

    assertChecklistEvidenceKey(access.organizationId, data.itemId, data.s3Key)

    if (!mockUploadsEnabled) {
      bucket = requireAttachmentsBucketName()
      await assertUploadedObject({
        bucket,
        key: data.s3Key,
        contentType: data.contentType,
        sizeBytes: data.sizeBytes,
      })
    }

    const effectiveBucket = bucket ?? getEffectiveAttachmentsBucketName()
    if (!effectiveBucket) {
      throw new Error('Attachment storage is not configured')
    }

    await recordEvidenceFileScanPending(db, {
      tenantId: access.organizationId,
      s3Key: data.s3Key,
      uploadedBy: access.userId,
      avStatus: mockUploadsEnabled ? 'skipped' : 'pending',
    })

    if (!mockUploadsEnabled) {
      await dispatchAttachmentScanRequest({
        organizationId: access.organizationId,
        key: data.s3Key,
        bucket: effectiveBucket,
        contentType: data.contentType,
        sizeBytes: data.sizeBytes,
      })
    }

    const updated = await runInAuditContext(access.userId, () =>
      attachEvidence(db, {
        itemId: data.itemId,
        tenantId: access.organizationId,
        actorId: access.userId,
        evidence: `storage://${effectiveBucket}/${data.s3Key}`,
      }),
    )

    return {
      ...updated,
      evidenceScanStatus: mockUploadsEnabled ? 'skipped' : 'pending',
    }
  })

export async function downloadChecklistEvidence(itemId: string) {
  const { db, access, item } = await requireScopedChecklistItem(itemId)

  if (!item.evidence) {
    throw new Error('Checklist evidence not found')
  }

  const storedEvidence = parseS3Uri(item.evidence)
  if (!storedEvidence) {
    throw new Error('Invalid evidence key')
  }

  const mockUploadsEnabled = isMockUploadsEnabled()
  const expectedBucket = mockUploadsEnabled
    ? getEffectiveAttachmentsBucketName()
    : requireAttachmentsBucketName()

  if (!expectedBucket) {
    throw new Error('Attachment storage is not configured')
  }

  if (storedEvidence.bucket !== expectedBucket) {
    throw new Error('Invalid evidence bucket')
  }

  assertChecklistEvidenceKey(access.organizationId, itemId, storedEvidence.key)

  if (mockUploadsEnabled) {
    return { downloadUrl: buildMockUploadUrl(storedEvidence.key) }
  }

  await assertEvidenceFileScanClean(db, {
    tenantId: access.organizationId,
    s3Key: storedEvidence.key,
  })

  const downloadUrl = await generatePresignedDownloadUrl({
    bucket: expectedBucket,
    key: storedEvidence.key,
    organizationId: access.organizationId,
    expiresIn: 900,
  })

  return { downloadUrl }
}

export const downloadChecklistEvidenceFn = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ itemId: z.string().uuid() }))
  .handler(async ({ data }) => downloadChecklistEvidence(data.itemId))

// ---------------------------------------------------------------------------
// Incidents
// ---------------------------------------------------------------------------

export const listIncidentsFn = createServerFn({ method: 'GET' })
  .inputValidator(
    z.object({
      status: z.enum(['reported', 'triaging', 'contained', 'resolved', 'closed']).optional(),
      locationId: z.string().uuid().optional(),
    }),
  )
  .handler(async ({ data: filters }) => {
    const { db, access } = await requireComplianceAccess()
    const locationIds = getReadLocationIds(access, filters.locationId)

    if (isEmptyLocationScope(locationIds)) {
      return []
    }

    return runInAuditContext(access.userId, async () => {
      const rows = await db
        .select()
        .from(incidents)
        .where(
          and(
            eq(incidents.tenantId, access.organizationId),
            inArray(incidents.locationId, locationIds),
            ...(filters.status ? [eq(incidents.status, filters.status)] : []),
          ),
        )
        .orderBy(desc(incidents.reportedAt))

      return rows
    })
  })

export const getIncidentFn = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ incidentId: z.string().uuid() }))
  .handler(async ({ data }) => {
    const { db, access } = await requireComplianceAccess()
    const locationIds = requireReadableLocationIds(getReadLocationIds(access), 'Incident not found')

    return runInAuditContext(access.userId, async () => {
      const [incident] = await db
        .select()
        .from(incidents)
        .where(
          and(
            eq(incidents.id, data.incidentId),
            eq(incidents.tenantId, access.organizationId),
            inArray(incidents.locationId, locationIds),
          ),
        )
        .limit(1)

      if (!incident) throw new Error('Incident not found')

      return incident
    })
  })

export const createIncidentFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      title: z.string().min(1).max(200),
      // summary may contain PHI - never log it
      summary: z.string().max(2000).optional(),
      severity: z.enum(['low', 'medium', 'high', 'critical']),
      locationId: z.string().uuid().optional(),
      category: z.enum([
        'unauthorized_access',
        'lost_device',
        'phishing',
        'improper_disposal',
        'system_compromise',
        'workforce_violation',
        'other',
      ]),
      discoveredAt: z.string().datetime(),
      discoveredBy: z.string().uuid().optional(),
      affectedSystems: z.array(z.string()).optional(),
    }),
  )
  .handler(async ({ data }) => {
    const { db, access } = await requireComplianceAccess()
    await assertIncidentDiscovererBelongsToOrganization(
      db,
      access.organizationId,
      data.discoveredBy,
    )

    return runInAuditContext(access.userId, () =>
      createIncident(db, {
        tenantId: access.organizationId,
        locationId: getWriteLocationId(access, data.locationId),
        title: data.title,
        summary: data.summary,
        severity: data.severity,
        category: data.category,
        discoveredAt: new Date(data.discoveredAt),
        discoveredBy: data.discoveredBy,
        affectedSystems: data.affectedSystems,
        actorId: access.userId,
      }),
    )
  })

export const transitionIncidentFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      incidentId: z.string().uuid(),
      toStatus: z.enum(['triaging', 'contained', 'resolved', 'closed']),
    }),
  )
  .handler(async ({ data }) => {
    const { db, access } = await requireComplianceAccess()
    const locationIds = requireReadableLocationIds(getReadLocationIds(access), 'Incident not found')
    const [incident] = await db
      .select()
      .from(incidents)
      .where(
        and(
          eq(incidents.id, data.incidentId),
          eq(incidents.tenantId, access.organizationId),
          inArray(incidents.locationId, locationIds),
        ),
      )
      .limit(1)

    if (!incident) throw new Error('Incident not found')

    getWriteLocationId(access, incident.locationId)

    return runInAuditContext(access.userId, () =>
      transitionIncident(db, {
        incidentId: data.incidentId,
        tenantId: access.organizationId,
        actorId: access.userId,
        toStatus: data.toStatus,
      }),
    )
  })

// ---------------------------------------------------------------------------
// Policies
// ---------------------------------------------------------------------------

export const listPoliciesFn = createServerFn({ method: 'GET' }).handler(async () => {
  const { db, access } = await requireComplianceAccess()

  return runInAuditContext(access.userId, async () => {
    const rows = await db
      .select()
      .from(policies)
      .where(eq(policies.tenantId, access.organizationId))
      .orderBy(desc(policies.createdAt))

    return rows
  })
})

export const listPolicyAssignmentsFn = createServerFn({ method: 'GET' })
  .inputValidator(
    z.object({
      locationId: z.string().uuid().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const { db, access } = await requireComplianceAccess()
    const locationIds = getReadLocationIds(access, data.locationId)

    if (isEmptyLocationScope(locationIds)) {
      return []
    }

    return runInAuditContext(access.userId, async () => {
      const assignments = await db
        .select()
        .from(policyAssignments)
        .where(
          and(
            eq(policyAssignments.tenantId, access.organizationId),
            inArray(policyAssignments.locationId, locationIds),
          ),
        )
        .orderBy(desc(policyAssignments.assignedAt))

      return assignments
    })
  })

export const assignPolicyToLocationsFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      policyId: z.string().uuid(),
      locationIds: z.array(z.string().uuid()).min(1),
      dueAt: z.string().datetime().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const { db, access } = await requireOrgWideComplianceAccess()

    for (const locationId of data.locationIds) {
      getWriteLocationId(access, locationId)
    }

    return runInAuditContext(access.userId, () =>
      assignPolicyToLocations(db, {
        tenantId: access.organizationId,
        policyId: data.policyId,
        locationIds: data.locationIds,
        actorId: access.userId,
        dueAt: data.dueAt ? new Date(data.dueAt) : undefined,
      }),
    )
  })

export const completePolicyAssignmentFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      assignmentId: z.string().uuid(),
    }),
  )
  .handler(async ({ data }) => {
    const { db, access } = await requireComplianceAccess()
    const locationIds = getReadLocationIds(access)

    if (isEmptyLocationScope(locationIds)) {
      throw new Error('Policy assignment not found')
    }

    const assignments = await listPolicyAssignments(db, {
      tenantId: access.organizationId,
      locationIds,
    })
    const assignment = assignments.find((row) => row.id === data.assignmentId)

    if (!assignment) {
      throw new Error('Policy assignment not found')
    }

    getWriteLocationId(access, assignment.locationId)

    return runInAuditContext(access.userId, () =>
      completePolicyAssignment(db, {
        tenantId: access.organizationId,
        assignmentId: data.assignmentId,
        actorId: access.userId,
      }),
    )
  })

export const reopenPolicyAssignmentFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      assignmentId: z.string().uuid(),
    }),
  )
  .handler(async ({ data }) => {
    const { db, access } = await requireComplianceAccess()
    const locationIds = getReadLocationIds(access)

    if (isEmptyLocationScope(locationIds)) {
      throw new Error('Policy assignment not found')
    }

    const assignments = await listPolicyAssignments(db, {
      tenantId: access.organizationId,
      locationIds,
    })
    const assignment = assignments.find((row) => row.id === data.assignmentId)

    if (!assignment) {
      throw new Error('Policy assignment not found')
    }

    getWriteLocationId(access, assignment.locationId)

    return runInAuditContext(access.userId, () =>
      reopenPolicyAssignment(db, {
        tenantId: access.organizationId,
        assignmentId: data.assignmentId,
        actorId: access.userId,
      }),
    )
  })

// ---------------------------------------------------------------------------
// Checklists - archive, rename, delete
// ---------------------------------------------------------------------------

async function requireWritableChecklist(checklistId: string) {
  const { db, access } = await requireOrgWideComplianceAccess()
  const locationIds = requireReadableLocationIds(getReadLocationIds(access), 'Checklist not found')

  const [checklist] = await db
    .select()
    .from(checklists)
    .where(
      and(
        eq(checklists.id, checklistId),
        eq(checklists.tenantId, access.organizationId),
        inArray(checklists.locationId, locationIds),
      ),
    )
    .limit(1)

  if (!checklist) throw new Error('Checklist not found')

  getWriteLocationId(access, checklist.locationId)

  return { db, access, checklist }
}

export const archiveChecklistFn = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ checklistId: z.string().uuid() }))
  .handler(async ({ data }) => {
    const { db, access } = await requireWritableChecklist(data.checklistId)

    return runInAuditContext(access.userId, () =>
      archiveChecklist(db, {
        checklistId: data.checklistId,
        tenantId: access.organizationId,
        actorId: access.userId,
      }),
    )
  })

export const renameChecklistFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      checklistId: z.string().uuid(),
      name: z.string().min(1).max(200),
    }),
  )
  .handler(async ({ data }) => {
    const { db, access } = await requireWritableChecklist(data.checklistId)

    return runInAuditContext(access.userId, () =>
      renameChecklist(db, {
        checklistId: data.checklistId,
        tenantId: access.organizationId,
        actorId: access.userId,
        name: data.name,
      }),
    )
  })

export const deleteChecklistFn = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ checklistId: z.string().uuid() }))
  .handler(async ({ data }) => {
    const { db, access } = await requireWritableChecklist(data.checklistId)

    return runInAuditContext(access.userId, () =>
      deleteChecklist(db, {
        checklistId: data.checklistId,
        tenantId: access.organizationId,
        actorId: access.userId,
      }),
    )
  })

// ---------------------------------------------------------------------------
// Incidents - edit + append-only notes
// ---------------------------------------------------------------------------

export const updateIncidentFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      incidentId: z.string().uuid(),
      title: z.string().min(1).max(200).optional(),
      // summary may contain PHI - never log it
      summary: z.string().max(2000).nullable().optional(),
      severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
      category: z
        .enum([
          'unauthorized_access',
          'lost_device',
          'phishing',
          'improper_disposal',
          'system_compromise',
          'workforce_violation',
          'other',
        ])
        .optional(),
    }).refine(
      (input) =>
        input.title !== undefined ||
        input.summary !== undefined ||
        input.severity !== undefined ||
        input.category !== undefined,
      { message: 'At least one incident field must be provided' },
    ),
  )
  .handler(async ({ data }) => {
    const { db, access } = await requireComplianceAccess()
    const locationIds = requireReadableLocationIds(getReadLocationIds(access), 'Incident not found')

    const [incident] = await db
      .select()
      .from(incidents)
      .where(
        and(
          eq(incidents.id, data.incidentId),
          eq(incidents.tenantId, access.organizationId),
          inArray(incidents.locationId, locationIds),
        ),
      )
      .limit(1)

    if (!incident) throw new Error('Incident not found')

    getWriteLocationId(access, incident.locationId)

    return runInAuditContext(access.userId, () =>
      updateIncident(db, {
        incidentId: data.incidentId,
        tenantId: access.organizationId,
        actorId: access.userId,
        title: data.title,
        summary: data.summary,
        severity: data.severity,
        category: data.category,
      }),
    )
  })

export const appendIncidentUpdateFn = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      incidentId: z.string().uuid(),
      // text field may contain operational context - never log it
      text: z.string().min(1).max(5000),
    }),
  )
  .handler(async ({ data }) => {
    const { db, access } = await requireComplianceAccess()
    const locationIds = requireReadableLocationIds(getReadLocationIds(access), 'Incident not found')

    const [incident] = await db
      .select()
      .from(incidents)
      .where(
        and(
          eq(incidents.id, data.incidentId),
          eq(incidents.tenantId, access.organizationId),
          inArray(incidents.locationId, locationIds),
        ),
      )
      .limit(1)

    if (!incident) throw new Error('Incident not found')

    getWriteLocationId(access, incident.locationId)

    return runInAuditContext(access.userId, () =>
      appendIncidentUpdate(db, {
        incidentId: data.incidentId,
        tenantId: access.organizationId,
        authorId: access.userId,
        text: data.text,
      }),
    )
  })

export const listIncidentUpdatesFn = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ incidentId: z.string().uuid() }))
  .handler(async ({ data }) => {
    const { db, access } = await requireComplianceAccess()
    const locationIds = requireReadableLocationIds(getReadLocationIds(access), 'Incident not found')

    const [incident] = await db
      .select()
      .from(incidents)
      .where(
        and(
          eq(incidents.id, data.incidentId),
          eq(incidents.tenantId, access.organizationId),
          inArray(incidents.locationId, locationIds),
        ),
      )
      .limit(1)

    if (!incident) throw new Error('Incident not found')

    return runInAuditContext(access.userId, () =>
      listIncidentUpdates(db, {
        incidentId: data.incidentId,
        tenantId: access.organizationId,
      }),
    )
  })
