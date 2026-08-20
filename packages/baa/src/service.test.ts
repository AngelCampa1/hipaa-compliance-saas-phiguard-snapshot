import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createHash } from 'node:crypto'
import { BaaService } from './service.js'
import { getStandardLegalDocument, hashDocument } from './documents.js'

const { legalAcceptancesMock, membershipsMock, organizationsMock, auditContextMock, writeAuditEventMock } =
  vi.hoisted(() => ({
    legalAcceptancesMock: { id: 'id', tenantId: 'tenant_id' },
    membershipsMock: { id: 'id', tenantId: 'tenant_id', userId: 'user_id' },
    organizationsMock: { id: 'id' },
    auditContextMock: vi.fn(),
    writeAuditEventMock: vi.fn(),
  }))

vi.mock('@phiguard/audit', () => ({
  getAuditContext: auditContextMock,
  writeAuditEvent: writeAuditEventMock,
}))

vi.mock('@phiguard/db', () => ({
  legalAcceptances: legalAcceptancesMock,
  memberships: membershipsMock,
  organizations: organizationsMock,
}))

vi.mock('drizzle-orm', () => ({
  and: vi.fn((...conditions) => ({ and: conditions })),
  eq: vi.fn((col, val) => ({ col, val })),
  desc: vi.fn((col) => ({ col, desc: true })),
}))

function makeTx(
  rows: Array<Record<string, unknown>> = [],
  organizationUpdateRows: Array<Record<string, unknown>> = [{ id: 'org-123' }],
  membershipRows: Array<Record<string, unknown>> = [{ id: 'membership-123' }],
) {
  const insertValues = vi.fn().mockResolvedValue(undefined)
  const updateReturning = vi.fn().mockResolvedValue(organizationUpdateRows)
  const updateWhere = vi.fn().mockReturnValue({ returning: updateReturning })
  const updateSet = vi.fn().mockReturnValue({ where: updateWhere })
  const selectOrderBy = vi.fn().mockResolvedValue(rows)
  const selectLimit = vi.fn().mockResolvedValue(membershipRows)
  const selectWhere = vi.fn().mockReturnValue({ limit: selectLimit, orderBy: selectOrderBy })
  const selectFrom = vi.fn().mockReturnValue({ where: selectWhere })

  return {
    insert: vi.fn().mockReturnValue({ values: insertValues }),
    update: vi.fn().mockReturnValue({ set: updateSet }),
    select: vi.fn().mockReturnValue({ from: selectFrom }),
    insertValues,
    updateSet,
    updateWhere,
    updateReturning,
    selectOrderBy,
    selectLimit,
  }
}

function makeDb(
  rows: Array<Record<string, unknown>> = [],
  organizationUpdateRows: Array<Record<string, unknown>> = [{ id: 'org-123' }],
  membershipRows: Array<Record<string, unknown>> = [{ id: 'membership-123' }],
) {
  const tx = makeTx(rows, organizationUpdateRows, membershipRows)

  return {
    transaction: vi
      .fn()
      .mockImplementation(async (fn: (db: typeof tx) => Promise<unknown>) => fn(tx)),
    select: tx.select,
    tx,
  }
}

function pdfArtifact(content: string) {
  const buffer = Buffer.from(content)

  return {
    contentBase64: buffer.toString('base64'),
    sha256: createHash('sha256').update(buffer).digest('hex'),
    sizeBytes: buffer.byteLength,
    mimeType: 'application/pdf',
  }
}

describe('BaaService', () => {
  const terms = getStandardLegalDocument('terms')
  const baa = getStandardLegalDocument('baa')

  beforeEach(() => {
    vi.clearAllMocks()
    auditContextMock.mockReturnValue({
      ip: '203.0.113.5',
      userAgent: 'Vitest',
    })
    writeAuditEventMock.mockResolvedValue(undefined)
  })

  it('stores acceptance rows for terms and baa and updates organization legal timestamps', async () => {
    const db = makeDb()
    const service = new BaaService()
    const acceptedAt = new Date('2026-04-21T10:00:00.000Z')

    const result = await service.acceptLegalDocuments(
      {
        orgId: 'org-123',
        userId: 'user-456',
        userEmail: 'admin@clinic.test',
        customerEntityName: 'Riverside Family Practice, PLLC',
        signerName: 'Jane Admin',
        signerTitle: 'Founder',
        acceptedAt,
        expectedTermsVersion: terms.version,
        expectedTermsHash: hashDocument(terms),
        expectedBaaVersion: baa.version,
        expectedBaaHash: hashDocument(baa),
        executedArtifacts: {
          terms: pdfArtifact('terms-pdf'),
          baa: pdfArtifact('baa-pdf'),
        },
      },
      db as never,
    )

    expect(db.tx.insert).toHaveBeenCalledTimes(2)
    expect(db.tx.insertValues).toHaveBeenCalledTimes(2)
    expect(db.tx.updateSet).toHaveBeenCalledWith(
      expect.objectContaining({
        baaSignedByUserId: 'user-456',
        termsAcceptedByUserId: 'user-456',
        baaSignedAt: acceptedAt,
        termsAcceptedAt: acceptedAt,
      }),
    )
    expect(db.tx.updateReturning).toHaveBeenCalledWith({ id: organizationsMock.id })
    expect(writeAuditEventMock).toHaveBeenCalledTimes(2)
    expect(writeAuditEventMock).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        tenantId: 'org-123',
        actorId: 'user-456',
        action: 'terms.accepted',
        resourceType: 'legal_acceptance',
        resourceId: 'org-123:terms:2026-04-21T10:00:00.000Z',
        after: {
          documentType: 'terms',
          documentVersion: terms.version,
          acceptedAt,
        },
      }),
    )
    expect(writeAuditEventMock).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        tenantId: 'org-123',
        actorId: 'user-456',
        action: 'baa.accepted',
        resourceType: 'legal_acceptance',
        resourceId: 'org-123:baa:2026-04-21T10:00:00.000Z',
        after: {
          documentType: 'baa',
          documentVersion: baa.version,
          acceptedAt,
        },
      }),
    )
    expect(result).toEqual({
      acceptedAt,
    })
  })

  it('rejects legal acceptance when organization timestamps cannot be updated', async () => {
    const db = makeDb([], [])
    const service = new BaaService()
    const acceptedAt = new Date('2026-04-21T10:00:00.000Z')

    await expect(
      service.acceptLegalDocuments(
        {
          orgId: 'org-123',
          userId: 'user-456',
          userEmail: 'admin@clinic.test',
          customerEntityName: 'Riverside Family Practice, PLLC',
          signerName: 'Jane Admin',
          signerTitle: 'Founder',
          acceptedAt,
          expectedTermsVersion: terms.version,
          expectedTermsHash: hashDocument(terms),
          expectedBaaVersion: baa.version,
          expectedBaaHash: hashDocument(baa),
          executedArtifacts: {
            terms: pdfArtifact('terms-pdf'),
            baa: pdfArtifact('baa-pdf'),
          },
        },
        db as never,
      ),
    ).rejects.toThrow('Organization not found')

    expect(db.tx.updateReturning).toHaveBeenCalledWith({ id: organizationsMock.id })
  })

  it('rejects oversized legal signer text before starting a transaction', async () => {
    const db = makeDb()
    const service = new BaaService()
    const acceptedAt = new Date('2026-04-21T10:00:00.000Z')

    await expect(
      service.acceptLegalDocuments(
        {
          orgId: 'org-123',
          userId: 'user-456',
          userEmail: 'admin@clinic.test',
          customerEntityName: 'A'.repeat(201),
          signerName: 'Jane Admin',
          signerTitle: 'Founder',
          acceptedAt,
          expectedTermsVersion: terms.version,
          expectedTermsHash: hashDocument(terms),
          expectedBaaVersion: baa.version,
          expectedBaaHash: hashDocument(baa),
          executedArtifacts: {},
        },
        db as never,
      ),
    ).rejects.toThrow('Customer entity name must be 200 characters or fewer')

    expect(db.transaction).not.toHaveBeenCalled()
    expect(writeAuditEventMock).not.toHaveBeenCalled()
  })

  it('rejects legal acceptance when the signer is not an organization member', async () => {
    const db = makeDb([], [{ id: 'org-123' }], [])
    const service = new BaaService()
    const acceptedAt = new Date('2026-04-21T10:00:00.000Z')

    await expect(
      service.acceptLegalDocuments(
        {
          orgId: 'org-123',
          userId: 'user-456',
          userEmail: 'admin@clinic.test',
          customerEntityName: 'Riverside Family Practice, PLLC',
          signerName: 'Jane Admin',
          signerTitle: 'Founder',
          acceptedAt,
          expectedTermsVersion: terms.version,
          expectedTermsHash: hashDocument(terms),
          expectedBaaVersion: baa.version,
          expectedBaaHash: hashDocument(baa),
          executedArtifacts: {
            terms: pdfArtifact('terms-pdf'),
            baa: pdfArtifact('baa-pdf'),
          },
        },
        db as never,
      ),
    ).rejects.toThrow('Legal signer is not a member of this organization')

    expect(db.tx.insertValues).not.toHaveBeenCalled()
    expect(db.tx.updateSet).not.toHaveBeenCalled()
    expect(writeAuditEventMock).not.toHaveBeenCalled()
  })

  it('returns current acceptance state for both standard documents', async () => {
    const acceptedAt = new Date('2026-04-21T10:00:00.000Z')
    const db = makeDb([
      {
        documentType: 'baa',
        documentVersion: '2026-04-21.1',
        acceptedAt,
      },
      {
        documentType: 'terms',
        documentVersion: '2026-04-21.1',
        acceptedAt,
      },
    ])
    const service = new BaaService()

    const status = await service.getLegalStatus({ orgId: 'org-123' }, db as never)

    expect(status).toEqual({
      terms: expect.objectContaining({
        acceptedAt,
        acceptedVersion: '2026-04-21.1',
        currentVersion: terms.version,
        isCurrent: false,
      }),
      baa: expect.objectContaining({
        acceptedAt,
        acceptedVersion: baa.version,
        currentVersion: baa.version,
        isCurrent: true,
      }),
    })
  })

  it('rejects acceptance when the reviewed document version or hash is stale', async () => {
    const db = makeDb()
    const service = new BaaService()

    await expect(
      service.acceptLegalDocuments(
        {
          orgId: 'org-123',
          userId: 'user-456',
          userEmail: 'admin@clinic.test',
          customerEntityName: 'Riverside Family Practice, PLLC',
          signerName: 'Jane Admin',
          signerTitle: 'Founder',
          acceptedAt: new Date('2026-04-21T10:00:00.000Z'),
          expectedTermsVersion: '2026-04-20.1',
          expectedTermsHash: 'old-hash',
          expectedBaaVersion: baa.version,
          expectedBaaHash: hashDocument(baa),
          executedArtifacts: {
            terms: pdfArtifact('terms-pdf'),
            baa: pdfArtifact('baa-pdf'),
          },
        },
        db as never,
      ),
    ).rejects.toThrow('The legal documents changed before acceptance was submitted')
  })

  it('rejects executed legal artifacts with mismatched integrity metadata', async () => {
    const db = makeDb()
    const service = new BaaService()
    const acceptedAt = new Date('2026-04-21T10:00:00.000Z')

    await expect(
      service.acceptLegalDocuments(
        {
          orgId: 'org-123',
          userId: 'user-456',
          userEmail: 'admin@clinic.test',
          customerEntityName: 'Riverside Family Practice, PLLC',
          signerName: 'Jane Admin',
          signerTitle: 'Founder',
          acceptedAt,
          expectedTermsVersion: terms.version,
          expectedTermsHash: hashDocument(terms),
          expectedBaaVersion: baa.version,
          expectedBaaHash: hashDocument(baa),
          executedArtifacts: {
            terms: {
              ...pdfArtifact('terms-pdf'),
              sha256: 'wrong-sha',
            },
          },
        },
        db as never,
      ),
    ).rejects.toThrow('Invalid executed terms artifact hash')

    expect(db.transaction).toHaveBeenCalled()
    expect(db.tx.insertValues).not.toHaveBeenCalled()
  })

  it('returns the latest acceptance snapshot for the requested document type', async () => {
    const acceptedAt = new Date('2026-04-21T10:00:00.000Z')
    const db = makeDb([
      {
        documentType: 'baa',
        acceptedAt,
        customerEntityName: 'Riverside Family Practice, PLLC',
        signerName: 'Jane Admin',
        signerTitle: 'Founder',
        signerEmail: 'admin@clinic.test',
        executedPdfBase64: Buffer.from('baa-pdf').toString('base64'),
        executedPdfSha256: 'baa-pdf-sha',
        executedPdfSizeBytes: Buffer.from('baa-pdf').byteLength,
        executedPdfMimeType: 'application/pdf',
        snapshot: {
          type: 'baa',
          title: 'PHIGuard Business Associate Agreement',
          version: '2026-04-21.1',
          effectiveDate: '2026-04-21',
          partyName: 'PHIGuard',
          noticeAddress: 'Address removed — service retired',
          signatoryName: 'Angel Campa',
          signatoryTitle: 'Founder',
          sections: [],
        },
      },
    ])
    const service = new BaaService()

    const acceptance = await service.getLatestAcceptance(
      { orgId: 'org-123', documentType: 'baa' },
      db as never,
    )

    expect(acceptance).toEqual({
      acceptedAt,
      customerEntityName: 'Riverside Family Practice, PLLC',
      signerName: 'Jane Admin',
      signerTitle: 'Founder',
      signerEmail: 'admin@clinic.test',
      executedPdfBase64: Buffer.from('baa-pdf').toString('base64'),
      executedPdfSha256: 'baa-pdf-sha',
      executedPdfSizeBytes: Buffer.from('baa-pdf').byteLength,
      executedPdfMimeType: 'application/pdf',
      snapshot: expect.objectContaining({
        type: 'baa',
        version: '2026-04-21.1',
      }),
    })
  })

  it('stores null executed artifact fields when pdf rendering is unavailable', async () => {
    const db = makeDb()
    const service = new BaaService()
    const acceptedAt = new Date('2026-04-21T10:00:00.000Z')

    await service.acceptLegalDocuments(
      {
        orgId: 'org-123',
        userId: 'user-456',
        userEmail: 'admin@clinic.test',
        customerEntityName: 'Riverside Family Practice, PLLC',
        signerName: 'Jane Admin',
        signerTitle: 'Founder',
        acceptedAt,
        expectedTermsVersion: terms.version,
        expectedTermsHash: hashDocument(terms),
        expectedBaaVersion: baa.version,
        expectedBaaHash: hashDocument(baa),
        executedArtifacts: {},
      },
      db as never,
    )

    expect(db.tx.insertValues).toHaveBeenCalledWith(
      expect.objectContaining({
        executedPdfBase64: null,
        executedPdfSha256: null,
        executedPdfSizeBytes: null,
        executedPdfMimeType: null,
      }),
    )
  })
})
