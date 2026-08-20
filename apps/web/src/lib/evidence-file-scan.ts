import { and, eq } from 'drizzle-orm'
import { evidenceFileScans, type DB } from '@phiguard/db/server'

type EvidenceAvStatus = 'pending' | 'clean' | 'infected' | 'skipped'

export async function recordEvidenceFileScanPending(
  db: DB,
  input: {
    tenantId: string
    s3Key: string
    uploadedBy: string
    avStatus?: EvidenceAvStatus
  },
) {
  const now = new Date()
  const avStatus = input.avStatus ?? 'pending'
  await db
    .insert(evidenceFileScans)
    .values({
      tenantId: input.tenantId,
      s3Key: input.s3Key,
      uploadedBy: input.uploadedBy,
      avStatus,
      scannedAt: avStatus === 'skipped' ? now : null,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: [evidenceFileScans.tenantId, evidenceFileScans.s3Key],
      set: {
        avStatus,
        uploadedBy: input.uploadedBy,
        scannedAt: avStatus === 'skipped' ? now : null,
        updatedAt: now,
      },
    })
}

export async function updateEvidenceFileScanResult(
  db: DB,
  input: {
    tenantId: string
    s3Key: string
    avStatus: Extract<EvidenceAvStatus, 'clean' | 'infected'>
  },
) {
  const [scan] = await db
    .update(evidenceFileScans)
    .set({
      avStatus: input.avStatus,
      scannedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(evidenceFileScans.tenantId, input.tenantId),
        eq(evidenceFileScans.s3Key, input.s3Key),
        eq(evidenceFileScans.avStatus, 'pending'),
      ),
    )
    .returning()

  if (scan) {
    return scan
  }

  const [existing] = await db
    .select()
    .from(evidenceFileScans)
    .where(
      and(
        eq(evidenceFileScans.tenantId, input.tenantId),
        eq(evidenceFileScans.s3Key, input.s3Key),
        eq(evidenceFileScans.avStatus, input.avStatus),
      ),
    )
    .limit(1)

  return existing ?? null
}

export async function assertEvidenceFileScanClean(
  db: DB,
  input: {
    tenantId: string
    s3Key: string
  },
) {
  const [scan] = await db
    .select({ avStatus: evidenceFileScans.avStatus })
    .from(evidenceFileScans)
    .where(
      and(eq(evidenceFileScans.tenantId, input.tenantId), eq(evidenceFileScans.s3Key, input.s3Key)),
    )
    .limit(1)

  if (scan?.avStatus === 'clean' || scan?.avStatus === 'skipped') {
    return
  }

  if (scan?.avStatus === 'infected') {
    throw new Error('Evidence file failed malware scanning')
  }

  throw new Error('Evidence file scan is not complete')
}
