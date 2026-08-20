import { createHash } from 'node:crypto'
import { and, desc, eq } from 'drizzle-orm'
import type { DB } from '@phiguard/db'
import { legalAcceptances, memberships, organizations } from '@phiguard/db'
import { getAuditContext, writeAuditEvent } from '@phiguard/audit'
import {
  getStandardLegalDocument,
  hashDocument,
  type LegalDocumentSnapshot,
  type LegalDocumentType,
} from './documents.js'

type ExecutedArtifact = {
  contentBase64: string
  sha256: string
  sizeBytes: number
  mimeType: string
}

type LegalAcceptanceInput = {
  orgId: string
  userId: string
  userEmail: string
  customerEntityName: string
  signerName: string
  signerTitle: string
  acceptedAt: Date
  expectedTermsVersion: string
  expectedTermsHash: string
  expectedBaaVersion: string
  expectedBaaHash: string
  executedArtifacts: Partial<Record<LegalDocumentType, ExecutedArtifact>>
}

export const LEGAL_ACCEPTANCE_TEXT_LIMITS = {
  customerEntityName: 200,
  signerName: 120,
  signerTitle: 120,
  userEmail: 254,
} as const

function assertLegalAcceptanceTextBounds(opts: LegalAcceptanceInput) {
  const fields = [
    ['Customer entity name', opts.customerEntityName, LEGAL_ACCEPTANCE_TEXT_LIMITS.customerEntityName],
    ['Signer name', opts.signerName, LEGAL_ACCEPTANCE_TEXT_LIMITS.signerName],
    ['Signer title', opts.signerTitle, LEGAL_ACCEPTANCE_TEXT_LIMITS.signerTitle],
    ['Signer email', opts.userEmail, LEGAL_ACCEPTANCE_TEXT_LIMITS.userEmail],
  ] as const

  for (const [label, value, maxLength] of fields) {
    if (value.trim().length === 0) {
      throw new Error(`${label} is required`)
    }

    if (value.length > maxLength) {
      throw new Error(`${label} must be ${maxLength} characters or fewer`)
    }
  }
}

function verifyExecutedArtifact(artifact: ExecutedArtifact, type: LegalDocumentType) {
  const buffer = Buffer.from(artifact.contentBase64, 'base64')
  const normalizedBase64 = buffer.toString('base64')

  if (normalizedBase64 !== artifact.contentBase64 || buffer.byteLength === 0) {
    throw new Error(`Invalid executed ${type} artifact`)
  }

  if (buffer.byteLength !== artifact.sizeBytes) {
    throw new Error(`Invalid executed ${type} artifact size`)
  }

  const sha256 = createHash('sha256').update(buffer).digest('hex')
  if (sha256 !== artifact.sha256) {
    throw new Error(`Invalid executed ${type} artifact hash`)
  }

  if (artifact.mimeType !== 'application/pdf') {
    throw new Error(`Invalid executed ${type} artifact content type`)
  }
}

async function assertSignerBelongsToOrganization(
  db: Pick<DB, 'select'>,
  opts: { orgId: string; userId: string },
) {
  const [membership] = await db
    .select({ id: memberships.id })
    .from(memberships)
    .where(and(eq(memberships.tenantId, opts.orgId), eq(memberships.userId, opts.userId)))
    .limit(1)

  if (!membership) {
    throw new Error('Legal signer is not a member of this organization')
  }
}

export class BaaService {
  private getCurrentDocument(type: LegalDocumentType) {
    const snapshot = getStandardLegalDocument(type)

    return {
      snapshot,
      hash: hashDocument(snapshot),
    }
  }

  private buildLegalStatusForDocument(
    type: LegalDocumentType,
    latestAcceptance:
      | {
          acceptedAt: Date
          documentVersion: string
          contentHash?: string | null
        }
      | undefined,
  ) {
    const current = this.getCurrentDocument(type)

    return {
      acceptedAt: latestAcceptance?.acceptedAt ?? null,
      acceptedVersion: latestAcceptance?.documentVersion ?? null,
      acceptedHash: latestAcceptance?.contentHash ?? null,
      currentVersion: current.snapshot.version,
      currentHash: current.hash,
      isCurrent:
        latestAcceptance?.documentVersion === current.snapshot.version &&
        (!latestAcceptance?.contentHash || latestAcceptance.contentHash === current.hash),
    }
  }

  async acceptLegalDocuments(opts: LegalAcceptanceInput, db: DB): Promise<{ acceptedAt: Date }> {
    assertLegalAcceptanceTextBounds(opts)

    const terms = this.getCurrentDocument('terms')
    const baa = this.getCurrentDocument('baa')

    if (
      opts.expectedTermsVersion !== terms.snapshot.version ||
      opts.expectedTermsHash !== terms.hash ||
      opts.expectedBaaVersion !== baa.snapshot.version ||
      opts.expectedBaaHash !== baa.hash
    ) {
      throw new Error('The legal documents changed before acceptance was submitted')
    }

    const auditContext = getAuditContext()

    await db.transaction(async (tx) => {
      await assertSignerBelongsToOrganization(tx, { orgId: opts.orgId, userId: opts.userId })

      for (const type of ['terms', 'baa'] as const) {
        const current = type === 'terms' ? terms : baa
        const artifact = opts.executedArtifacts[type] ?? null
        if (artifact) {
          verifyExecutedArtifact(artifact, type)
        }

        await tx.insert(legalAcceptances).values({
          tenantId: opts.orgId,
          documentType: type,
          documentVersion: current.snapshot.version,
          documentTitle: current.snapshot.title,
          contentHash: current.hash,
          customerEntityName: opts.customerEntityName,
          signerName: opts.signerName,
          signerTitle: opts.signerTitle,
          signerEmail: opts.userEmail,
          acceptedByUserId: opts.userId,
          acceptedAt: opts.acceptedAt,
          ip: auditContext?.ip ?? null,
          userAgent: auditContext?.userAgent ?? null,
          snapshot: current.snapshot,
          executedPdfBase64: artifact?.contentBase64 ?? null,
          executedPdfSha256: artifact?.sha256 ?? null,
          executedPdfSizeBytes: artifact?.sizeBytes ?? null,
          executedPdfMimeType: artifact?.mimeType ?? null,
        })

        await writeAuditEvent(tx, {
          tenantId: opts.orgId,
          actorId: opts.userId,
          action: `${type}.accepted`,
          resourceType: 'legal_acceptance',
          resourceId: `${opts.orgId}:${type}:${opts.acceptedAt.toISOString()}`,
          after: {
            documentType: type,
            documentVersion: current.snapshot.version,
            acceptedAt: opts.acceptedAt,
          },
        })
      }

      const [updatedOrganization] = await tx
        .update(organizations)
        .set({
          baaSignedAt: opts.acceptedAt,
          baaSignedByUserId: opts.userId,
          termsAcceptedAt: opts.acceptedAt,
          termsAcceptedByUserId: opts.userId,
        })
        .where(eq(organizations.id, opts.orgId))
        .returning({ id: organizations.id })

      if (!updatedOrganization) {
        throw new Error('Organization not found')
      }
    })

    return { acceptedAt: opts.acceptedAt }
  }

  async getLegalStatus(opts: { orgId: string }, db: DB) {
    const acceptances = await db
      .select()
      .from(legalAcceptances)
      .where(eq(legalAcceptances.tenantId, opts.orgId))
      .orderBy(desc(legalAcceptances.acceptedAt))

    const latestByType = new Map<LegalDocumentType, (typeof acceptances)[number]>()

    for (const acceptance of acceptances) {
      const type = acceptance.documentType as LegalDocumentType
      if (!latestByType.has(type)) {
        latestByType.set(type, acceptance)
      }
    }

    return {
      terms: this.buildLegalStatusForDocument('terms', latestByType.get('terms')),
      baa: this.buildLegalStatusForDocument('baa', latestByType.get('baa')),
    }
  }

  async getLatestAcceptance(
    opts: { orgId: string; documentType: LegalDocumentType },
    db: DB,
  ): Promise<{
    acceptedAt: Date
    customerEntityName: string
    signerName: string
    signerTitle: string
    signerEmail: string
    executedPdfBase64: string | null
    executedPdfSha256: string | null
    executedPdfSizeBytes: number | null
    executedPdfMimeType: string | null
    snapshot: LegalDocumentSnapshot
  } | null> {
    const acceptances = await db
      .select()
      .from(legalAcceptances)
      .where(eq(legalAcceptances.tenantId, opts.orgId))
      .orderBy(desc(legalAcceptances.acceptedAt))

    const latest = acceptances.find((acceptance) => acceptance.documentType === opts.documentType)

    if (!latest) {
      return null
    }

    return {
      acceptedAt: latest.acceptedAt,
      customerEntityName: latest.customerEntityName,
      signerName: latest.signerName,
      signerTitle: latest.signerTitle,
      signerEmail: latest.signerEmail,
      executedPdfBase64: latest.executedPdfBase64,
      executedPdfSha256: latest.executedPdfSha256,
      executedPdfSizeBytes: latest.executedPdfSizeBytes,
      executedPdfMimeType: latest.executedPdfMimeType,
      snapshot: latest.snapshot as LegalDocumentSnapshot,
    }
  }
}
