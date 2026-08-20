import { createHash } from 'node:crypto'
import React from 'react'
import { createServerFn } from '@tanstack/react-start'
import { desc, eq } from 'drizzle-orm'
import { z } from 'zod'
import { legalAcceptances } from '@phiguard/db'
import { getDb } from '@phiguard/db/server'
import type { LegalDocumentType } from '@phiguard/baa'
import {
  BaaService,
  LEGAL_ACCEPTANCE_TEXT_LIMITS,
  getStandardLegalDocuments,
  hashDocument,
  serializeDocument,
} from '@phiguard/baa'
import { writeAuditEvent } from '@phiguard/audit'
import { LegalAgreementDocument, renderDocumentToBuffer } from '@phiguard/pdf'
import { getSessionFn } from '../lib/session.js'
import { canManageOrganization, resolveActiveLocationAccess } from './access.js'

async function requireBaaAdmin() {
  const { db, session, tenantId, canManageLegal } = await getBaaContext()

  if (!canManageLegal) {
    throw new Error('Only organization administrators can manage legal setup')
  }

  return { db, session, tenantId }
}

async function getBaaContext() {
  const session = await getSessionFn()
  if (!session) throw new Error('Unauthorized')

  const tenantId = session.session.activeOrganizationId
  if (!tenantId) throw new Error('No active organization')

  const db = getDb()
  const access = await resolveActiveLocationAccess(db, session)

  return {
    db,
    session,
    tenantId: access.organizationId,
    canManageLegal: canManageOrganization(access),
  }
}

async function renderExecutedArtifact(input: {
  type: LegalDocumentType
  customerEntityName: string
  signerName: string
  signerTitle: string
  signerEmail: string
  acceptedAt: Date
}) {
  const snapshot = getStandardLegalDocuments().find((document) => document.type === input.type)
  if (!snapshot) {
    throw new Error(`Unknown legal document type: ${input.type}`)
  }

  const buffer = await renderDocumentToBuffer(
    React.createElement(LegalAgreementDocument, {
      snapshot,
      customerEntityName: input.customerEntityName,
      signerName: input.signerName,
      signerTitle: input.signerTitle,
      signerEmail: input.signerEmail,
      acceptedAt: input.acceptedAt.toISOString(),
    }) as React.ReactElement,
  )

  return {
    contentBase64: buffer.toString('base64'),
    sha256: createHash('sha256').update(buffer).digest('hex'),
    sizeBytes: buffer.byteLength,
    mimeType: 'application/pdf',
  }
}

function verifyStoredExecutedArtifact(input: {
  documentType: LegalDocumentType
  contentBase64: string
  sha256: string | null
  sizeBytes: number | null
  mimeType: string
}) {
  if (input.mimeType !== 'application/pdf' || !input.sha256 || !input.sizeBytes) {
    throw new Error('Stored executed legal document failed integrity verification')
  }

  const buffer = Buffer.from(input.contentBase64, 'base64')
  if (buffer.toString('base64') !== input.contentBase64 || buffer.byteLength !== input.sizeBytes) {
    throw new Error('Stored executed legal document failed integrity verification')
  }

  const sha256 = createHash('sha256').update(buffer).digest('hex')
  if (sha256 !== input.sha256) {
    throw new Error('Stored executed legal document failed integrity verification')
  }
}

const acceptLegalDocumentsInput = z.object({
  customerEntityName: z
    .string()
    .min(1)
    .max(LEGAL_ACCEPTANCE_TEXT_LIMITS.customerEntityName),
  signerName: z.string().min(1).max(LEGAL_ACCEPTANCE_TEXT_LIMITS.signerName),
  signerTitle: z.string().min(1).max(LEGAL_ACCEPTANCE_TEXT_LIMITS.signerTitle),
  expectedTermsVersion: z.string().min(1),
  expectedTermsHash: z.string().min(1),
  expectedBaaVersion: z.string().min(1),
  expectedBaaHash: z.string().min(1),
  acceptTerms: z.literal(true),
  acceptBaa: z.literal(true),
})

export async function acceptLegalDocuments(data: z.infer<typeof acceptLegalDocumentsInput>) {
  const input = acceptLegalDocumentsInput.parse(data)
  const { db, session, tenantId } = await requireBaaAdmin()
  const { runInAuditContext } = await import('../lib/audit.server.js')

  return runInAuditContext(session.user.id, async () => {
    const acceptedAt = new Date()
    const executedArtifacts: Partial<
      Record<LegalDocumentType, Awaited<ReturnType<typeof renderExecutedArtifact>>>
    > = {}

    for (const type of ['terms', 'baa'] as const) {
      try {
        executedArtifacts[type] = await renderExecutedArtifact({
          type,
          customerEntityName: input.customerEntityName,
          signerName: input.signerName,
          signerTitle: input.signerTitle,
          signerEmail: session.user.email,
          acceptedAt,
        })
      } catch {
        // Rendering is best effort. Acceptance should still complete.
      }
    }

    return new BaaService().acceptLegalDocuments(
      {
        orgId: tenantId,
        userId: session.user.id,
        userEmail: session.user.email,
        customerEntityName: input.customerEntityName,
        signerName: input.signerName,
        signerTitle: input.signerTitle,
        acceptedAt,
        expectedTermsVersion: input.expectedTermsVersion,
        expectedTermsHash: input.expectedTermsHash,
        expectedBaaVersion: input.expectedBaaVersion,
        expectedBaaHash: input.expectedBaaHash,
        executedArtifacts,
      },
      db,
    )
  })
}

export const acceptLegalDocumentsFn = createServerFn({ method: 'POST' })
  .inputValidator(acceptLegalDocumentsInput)
  .handler(async ({ data }) => acceptLegalDocuments(data))

export async function getLegalStatus() {
  const standardDocuments = getStandardLegalDocuments()
  const documents = standardDocuments.map((document) => ({
    ...document,
    contentHash: hashDocument(document),
  }))
  const session = await getSessionFn()
  if (!session) throw new Error('Unauthorized')

  const sessionTenantId = session.session.activeOrganizationId
  if (!sessionTenantId) {
    return {
      canManageLegal: true,
      requiresReacceptance: true,
      fullyAccepted: false,
      documents,
    }
  }

  const db = getDb()
  const access = await resolveActiveLocationAccess(db, session)
  const tenantId = access.organizationId
  const canManageLegal = canManageOrganization(access)
  const acceptances = await db
    .select()
    .from(legalAcceptances)
    .where(eq(legalAcceptances.tenantId, tenantId))
    .orderBy(desc(legalAcceptances.acceptedAt))
  const latestByType = new Map<LegalDocumentType, (typeof acceptances)[number]>()
  for (const acceptance of acceptances) {
    if (!latestByType.has(acceptance.documentType)) {
      latestByType.set(acceptance.documentType, acceptance)
    }
  }
  const currentTerms = standardDocuments.find((document) => document.type === 'terms')
  const currentBaa = standardDocuments.find((document) => document.type === 'baa')
  const latestTerms = latestByType.get('terms')
  const latestBaa = latestByType.get('baa')
  const termsCurrent = Boolean(
    latestTerms &&
    currentTerms &&
    latestTerms.documentVersion === currentTerms.version &&
    (!latestTerms.contentHash || latestTerms.contentHash === hashDocument(currentTerms)),
  )
  const baaCurrent = Boolean(
    latestBaa &&
    currentBaa &&
    latestBaa.documentVersion === currentBaa.version &&
    (!latestBaa.contentHash || latestBaa.contentHash === hashDocument(currentBaa)),
  )
  const fullyAccepted = Boolean(
    latestTerms?.acceptedAt && latestBaa?.acceptedAt && termsCurrent && baaCurrent,
  )

  return {
    canManageLegal,
    requiresReacceptance: !fullyAccepted,
    fullyAccepted,
    documents,
  }
}

export const getLegalStatusFn = createServerFn({ method: 'GET' }).handler(async () =>
  getLegalStatus(),
)

export async function downloadExecutedLegalDocument(documentType: LegalDocumentType) {
  const { db, tenantId } = await requireBaaAdmin()
  const acceptance = await new BaaService().getLatestAcceptance(
    { orgId: tenantId, documentType },
    db,
  )

  if (!acceptance) {
    throw new Error('No executed legal document found')
  }

  if (acceptance.executedPdfBase64 && acceptance.executedPdfMimeType) {
    verifyStoredExecutedArtifact({
      documentType,
      contentBase64: acceptance.executedPdfBase64,
      sha256: acceptance.executedPdfSha256,
      sizeBytes: acceptance.executedPdfSizeBytes,
      mimeType: acceptance.executedPdfMimeType,
    })

    return {
      filename: `phiguard-${documentType}-${acceptance.snapshot.version}.pdf`,
      contentBase64: acceptance.executedPdfBase64,
      mimeType: acceptance.executedPdfMimeType,
    }
  }

  const content = serializeDocument(acceptance.snapshot)

  return {
    filename: `phiguard-${documentType}-${acceptance.snapshot.version}.txt`,
    contentBase64: Buffer.from(content, 'utf8').toString('base64'),
    mimeType: 'text/plain; charset=utf-8',
  }
}

/**
 * Records an `onboarding.legal_accepted_early` audit event when a user reaches
 * the dashboard via the early-accept onboarding path (i.e., legal was already
 * accepted in a prior session before the full onboarding wizard was completed).
 *
 * This captures the onboarding-completion signal that would otherwise be absent
 * when the normal wizard flow is bypassed.
 */
export async function recordEarlyLegalAcceptance() {
  const session = await getSessionFn()
  if (!session) throw new Error('Unauthorized')

  const tenantId = session.session.activeOrganizationId
  if (!tenantId) throw new Error('No active organization')

  const db = getDb()

  // Read the most-recently-accepted versions of both documents so we can
  // include them in the audit event's `after` payload.
  const recentAcceptances = await db
    .select({
      documentType: legalAcceptances.documentType,
      documentVersion: legalAcceptances.documentVersion,
      acceptedAt: legalAcceptances.acceptedAt,
    })
    .from(legalAcceptances)
    .where(eq(legalAcceptances.tenantId, tenantId))
    .orderBy(desc(legalAcceptances.acceptedAt))

  const latestByType = new Map<string, { documentVersion: string; acceptedAt: Date }>()
  for (const row of recentAcceptances) {
    if (!latestByType.has(row.documentType)) {
      latestByType.set(row.documentType, {
        documentVersion: row.documentVersion,
        acceptedAt: row.acceptedAt,
      })
    }
  }

  const latestTerms = latestByType.get('terms')
  const latestBaa = latestByType.get('baa')

  await db.transaction(async (tx) => {
    await writeAuditEvent(tx, {
      tenantId,
      actorId: session.user.id,
      action: 'onboarding.legal_accepted_early',
      resourceType: 'organization',
      resourceId: tenantId,
      before: { acceptedAt: null },
      after: {
        acceptedAt: (latestTerms?.acceptedAt ?? latestBaa?.acceptedAt ?? new Date()).toISOString(),
        termsVersion: latestTerms?.documentVersion ?? null,
        baaVersion: latestBaa?.documentVersion ?? null,
      },
    })
  })
}

export const recordEarlyLegalAcceptanceFn = createServerFn({ method: 'POST' }).handler(async () =>
  recordEarlyLegalAcceptance(),
)

export const downloadExecutedLegalDocumentFn = createServerFn({ method: 'GET' })
  .inputValidator(
    z.object({
      documentType: z.enum(['terms', 'baa']),
    }),
  )
  .handler(async ({ data }) => downloadExecutedLegalDocument(data.documentType))
