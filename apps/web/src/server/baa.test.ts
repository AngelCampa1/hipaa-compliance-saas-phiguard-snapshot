import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { createHash } from 'node:crypto'
import type { AppSession } from '../lib/session.js'

const {
  BaaServiceMock,
  acceptLegalDocumentsMock,
  canManageOrganizationMock,
  getDbMock,
  getLatestAcceptanceMock,
  getLegalStatusMock: _getLegalStatusMock,
  getSessionFnMock,
  renderDocumentToBufferMock,
  resolveActiveLocationAccessMock,
  runInAuditContextMock,
} = vi.hoisted(() => {
  const acceptLegalDocumentsMock = vi.fn()
  const getLegalStatusMock = vi.fn()
  const getLatestAcceptanceMock = vi.fn()

  return {
    getDbMock: vi.fn(),
    getSessionFnMock: vi.fn(),
    resolveActiveLocationAccessMock: vi.fn(),
    canManageOrganizationMock: vi.fn(),
    acceptLegalDocumentsMock,
    getLegalStatusMock,
    getLatestAcceptanceMock,
    renderDocumentToBufferMock: vi.fn(),
    runInAuditContextMock: vi.fn(),
    BaaServiceMock: vi.fn().mockImplementation(() => ({
      acceptLegalDocuments: acceptLegalDocumentsMock,
      getLegalStatus: getLegalStatusMock,
      getLatestAcceptance: getLatestAcceptanceMock,
    })),
  }
})

let baaModulePromise: Promise<typeof import('./baa.js')>

function pdfArtifact(content: string) {
  const buffer = Buffer.from(content)

  return {
    base64: buffer.toString('base64'),
    sha256: createHash('sha256').update(buffer).digest('hex'),
    sizeBytes: buffer.byteLength,
  }
}

vi.mock('@phiguard/db/server', () => ({
  getDb: getDbMock,
}))

vi.mock('../lib/session.js', () => ({
  getSessionFn: getSessionFnMock,
}))

vi.mock('./access.js', () => ({
  resolveActiveLocationAccess: resolveActiveLocationAccessMock,
  canManageOrganization: canManageOrganizationMock,
}))

vi.mock('../lib/audit.server.js', () => ({
  runInAuditContext: runInAuditContextMock,
}))

vi.mock('@phiguard/baa', () => ({
  BaaService: BaaServiceMock,
  LEGAL_ACCEPTANCE_TEXT_LIMITS: {
    customerEntityName: 200,
    signerName: 120,
    signerTitle: 120,
    userEmail: 254,
  },
  getStandardLegalDocuments: vi.fn(() => [
    {
      type: 'terms',
      title: 'PHIGuard Terms of Service',
      version: '2026-04-22.1',
    },
    {
      type: 'baa',
      title: 'PHIGuard Business Associate Agreement',
      version: '2026-04-21.1',
    },
  ]),
  serializeDocument: vi.fn(
    (document: { title: string; version: string }) =>
      `${document.title}\nVersion: ${document.version}`,
  ),
  hashDocument: vi.fn((document: { type: string }) => `${document.type}-hash`),
}))

vi.mock('@phiguard/pdf', () => ({
  renderDocumentToBuffer: renderDocumentToBufferMock,
  LegalAgreementDocument: 'LegalAgreementDocument',
}))

describe('legal server functions', () => {
  let db = makeLegalDb()

  beforeAll(async () => {
    baaModulePromise = import('./baa.js')
    await baaModulePromise
  }, 30_000)

  beforeEach(() => {
    vi.clearAllMocks()
    db = makeLegalDb()
    getDbMock.mockReturnValue(db)
    getSessionFnMock.mockResolvedValue(makeSession('user-1', 'org-1'))
    resolveActiveLocationAccessMock.mockResolvedValue({
      userId: 'user-1',
      organizationId: 'org-1',
      role: 'org_admin',
      accessLevel: 'organization',
      allowedLocationIds: [],
      locations: [],
      defaultLocationId: null,
      canAccessAllLocations: true,
    })
    canManageOrganizationMock.mockReturnValue(true)
    runInAuditContextMock.mockImplementation(async (_userId: string, fn: () => Promise<unknown>) =>
      fn(),
    )
    renderDocumentToBufferMock.mockResolvedValue(Buffer.from('pdf'))
  })

  it('records acceptance for the active organization', async () => {
    acceptLegalDocumentsMock.mockResolvedValue({
      acceptedAt: new Date('2026-04-21T10:00:00.000Z'),
    })

    const { acceptLegalDocuments } = await baaModulePromise

    const result = await acceptLegalDocuments({
      customerEntityName: 'Riverside Family Practice, PLLC',
      signerName: 'Jane Admin',
      signerTitle: 'Founder',
      expectedTermsVersion: '2026-04-22.1',
      expectedTermsHash: 'terms-hash',
      expectedBaaVersion: '2026-04-21.1',
      expectedBaaHash: 'baa-hash',
      acceptTerms: true,
      acceptBaa: true,
    })

    expect(runInAuditContextMock).toHaveBeenCalledWith('user-1', expect.any(Function))
    expect(renderDocumentToBufferMock).toHaveBeenCalledTimes(2)
    expect(acceptLegalDocumentsMock).toHaveBeenCalledWith(
      expect.objectContaining({
        orgId: 'org-1',
        userId: 'user-1',
        userEmail: 'user@example.com',
        customerEntityName: 'Riverside Family Practice, PLLC',
        signerName: 'Jane Admin',
        signerTitle: 'Founder',
        acceptedAt: expect.any(Date),
        expectedTermsVersion: '2026-04-22.1',
        expectedTermsHash: 'terms-hash',
        expectedBaaVersion: '2026-04-21.1',
        expectedBaaHash: 'baa-hash',
        executedArtifacts: {
          terms: expect.objectContaining({
            contentBase64: Buffer.from('pdf').toString('base64'),
            sha256: expect.any(String),
            sizeBytes: Buffer.from('pdf').byteLength,
            mimeType: 'application/pdf',
          }),
          baa: expect.objectContaining({
            contentBase64: Buffer.from('pdf').toString('base64'),
            sha256: expect.any(String),
            sizeBytes: Buffer.from('pdf').byteLength,
            mimeType: 'application/pdf',
          }),
        },
      }),
      db,
    )
    expect(result).toEqual({
      acceptedAt: new Date('2026-04-21T10:00:00.000Z'),
    })
  })

  it('rejects oversized legal text before rendering or persistence', async () => {
    const { acceptLegalDocuments } = await baaModulePromise

    await expect(
      acceptLegalDocuments({
        customerEntityName: 'A'.repeat(201),
        signerName: 'Jane Admin',
        signerTitle: 'Founder',
        expectedTermsVersion: '2026-04-22.1',
        expectedTermsHash: 'terms-hash',
        expectedBaaVersion: '2026-04-21.1',
        expectedBaaHash: 'baa-hash',
        acceptTerms: true,
        acceptBaa: true,
      }),
    ).rejects.toThrow()

    expect(renderDocumentToBufferMock).not.toHaveBeenCalled()
    expect(acceptLegalDocumentsMock).not.toHaveBeenCalled()
  })

  it('records acceptance for the resolved organization when the session active organization is stale', async () => {
    getSessionFnMock.mockResolvedValue(makeSession('user-1', 'org-stale'))
    resolveActiveLocationAccessMock.mockResolvedValue({
      userId: 'user-1',
      organizationId: 'org-1',
      role: 'org_admin',
      accessLevel: 'organization',
      allowedLocationIds: [],
      locations: [],
      defaultLocationId: null,
      canAccessAllLocations: true,
    })
    acceptLegalDocumentsMock.mockResolvedValue({
      acceptedAt: new Date('2026-04-21T10:00:00.000Z'),
    })

    const { acceptLegalDocuments } = await baaModulePromise

    await acceptLegalDocuments({
      customerEntityName: 'Riverside Family Practice, PLLC',
      signerName: 'Jane Admin',
      signerTitle: 'Founder',
      expectedTermsVersion: '2026-04-22.1',
      expectedTermsHash: 'terms-hash',
      expectedBaaVersion: '2026-04-21.1',
      expectedBaaHash: 'baa-hash',
      acceptTerms: true,
      acceptBaa: true,
    })

    expect(acceptLegalDocumentsMock).toHaveBeenCalledWith(
      expect.objectContaining({
        orgId: 'org-1',
      }),
      db,
    )
  })

  it('returns current legal status and standard documents', async () => {
    db = makeLegalDb([
      {
        documentType: 'terms',
        documentVersion: '2026-04-22.1',
        acceptedAt: new Date('2026-04-21T10:00:00.000Z'),
      },
      {
        documentType: 'baa',
        documentVersion: '2026-04-21.1',
        acceptedAt: new Date('2026-04-21T10:00:00.000Z'),
      },
    ])
    getDbMock.mockReturnValue(db)

    const { getLegalStatus } = await baaModulePromise
    const result = await getLegalStatus()

    expect(result).toEqual(
      expect.objectContaining({
        fullyAccepted: true,
        canManageLegal: true,
        requiresReacceptance: false,
        documents: expect.arrayContaining([
          expect.objectContaining({ type: 'terms' }),
          expect.objectContaining({ type: 'baa' }),
        ]),
      }),
    )
  })

  it('loads legal status for the resolved organization when the session active organization is stale', async () => {
    getSessionFnMock.mockResolvedValue(makeSession('user-1', 'org-stale'))
    resolveActiveLocationAccessMock.mockResolvedValue({
      userId: 'user-1',
      organizationId: 'org-1',
      role: 'org_admin',
      accessLevel: 'organization',
      allowedLocationIds: [],
      locations: [],
      defaultLocationId: null,
      canAccessAllLocations: true,
    })
    db = makeLegalDb([
      {
        documentType: 'terms',
        documentVersion: '2026-04-22.1',
        acceptedAt: new Date('2026-04-21T10:00:00.000Z'),
      },
      {
        documentType: 'baa',
        documentVersion: '2026-04-21.1',
        acceptedAt: new Date('2026-04-21T10:00:00.000Z'),
      },
    ])
    getDbMock.mockReturnValue(db)

    const { getLegalStatus } = await baaModulePromise
    const result = await getLegalStatus()

    expect(result).toEqual(
      expect.objectContaining({
        fullyAccepted: true,
        canManageLegal: true,
      }),
    )
  })

  it('returns standard documents for authenticated users before organization bootstrap', async () => {
    getSessionFnMock.mockResolvedValue(makeSession('user-1', null))

    const { getLegalStatus } = await baaModulePromise
    const result = await getLegalStatus()

    expect(resolveActiveLocationAccessMock).not.toHaveBeenCalled()
    expect(result).toEqual(
      expect.objectContaining({
        fullyAccepted: false,
        canManageLegal: true,
        requiresReacceptance: true,
        documents: expect.arrayContaining([
          expect.objectContaining({ type: 'terms', contentHash: 'terms-hash' }),
          expect.objectContaining({ type: 'baa', contentHash: 'baa-hash' }),
        ]),
      }),
    )
  })

  it('returns the stored executed agreement artifact for download', async () => {
    const artifact = pdfArtifact('stored-pdf')
    getLatestAcceptanceMock.mockResolvedValue({
      acceptedAt: new Date('2026-04-21T10:00:00.000Z'),
      customerEntityName: 'Riverside Family Practice, PLLC',
      signerName: 'Jane Admin',
      signerTitle: 'Founder',
      signerEmail: 'user@example.com',
      executedPdfBase64: artifact.base64,
      executedPdfSha256: artifact.sha256,
      executedPdfSizeBytes: artifact.sizeBytes,
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
    })

    const { downloadExecutedLegalDocument } = await baaModulePromise
    const result = await downloadExecutedLegalDocument('baa')

    expect(getLatestAcceptanceMock).toHaveBeenCalledWith(
      { orgId: 'org-1', documentType: 'baa' },
      db,
    )
    expect(renderDocumentToBufferMock).not.toHaveBeenCalled()
    expect(result).toEqual({
      filename: 'phiguard-baa-2026-04-21.1.pdf',
      contentBase64: artifact.base64,
      mimeType: 'application/pdf',
    })
  })

  it('rejects stored executed agreement artifacts with invalid integrity metadata', async () => {
    const artifact = pdfArtifact('stored-pdf')
    getLatestAcceptanceMock.mockResolvedValue({
      acceptedAt: new Date('2026-04-21T10:00:00.000Z'),
      customerEntityName: 'Riverside Family Practice, PLLC',
      signerName: 'Jane Admin',
      signerTitle: 'Founder',
      signerEmail: 'user@example.com',
      executedPdfBase64: artifact.base64,
      executedPdfSha256: 'wrong-sha',
      executedPdfSizeBytes: artifact.sizeBytes,
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
    })

    const { downloadExecutedLegalDocument } = await baaModulePromise

    await expect(downloadExecutedLegalDocument('baa')).rejects.toThrow(
      'Stored executed legal document failed integrity verification',
    )
  })

  it('continues acceptance when executed PDFs cannot be rendered', async () => {
    acceptLegalDocumentsMock.mockResolvedValue({
      acceptedAt: new Date('2026-04-21T10:00:00.000Z'),
    })
    renderDocumentToBufferMock.mockRejectedValue(new Error('react-pdf worker crash'))

    const { acceptLegalDocuments } = await baaModulePromise

    await expect(
      acceptLegalDocuments({
        customerEntityName: 'Riverside Family Practice, PLLC',
        signerName: 'Jane Admin',
        signerTitle: 'Founder',
        expectedTermsVersion: '2026-04-22.1',
        expectedTermsHash: 'terms-hash',
        expectedBaaVersion: '2026-04-21.1',
        expectedBaaHash: 'baa-hash',
        acceptTerms: true,
        acceptBaa: true,
      }),
    ).resolves.toEqual({
      acceptedAt: new Date('2026-04-21T10:00:00.000Z'),
    })

    expect(acceptLegalDocumentsMock).toHaveBeenCalledWith(
      expect.objectContaining({
        executedArtifacts: {},
      }),
      db,
    )
  })

  it('returns a text fallback when no stored executed pdf exists', async () => {
    getLatestAcceptanceMock.mockResolvedValue({
      acceptedAt: new Date('2026-04-21T10:00:00.000Z'),
      customerEntityName: 'Riverside Family Practice, PLLC',
      signerName: 'Jane Admin',
      signerTitle: 'Founder',
      signerEmail: 'user@example.com',
      executedPdfBase64: null,
      executedPdfSha256: null,
      executedPdfSizeBytes: null,
      executedPdfMimeType: null,
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
    })

    const { downloadExecutedLegalDocument } = await baaModulePromise
    const result = await downloadExecutedLegalDocument('baa')

    expect(renderDocumentToBufferMock).not.toHaveBeenCalled()
    expect(result.filename).toBe('phiguard-baa-2026-04-21.1.txt')
    expect(result.mimeType).toBe('text/plain; charset=utf-8')
    expect(Buffer.from(result.contentBase64, 'base64').toString('utf8')).toContain(
      'PHIGuard Business Associate Agreement',
    )
  })

  it('rejects unauthenticated access', async () => {
    getSessionFnMock.mockResolvedValue(null)

    const { acceptLegalDocuments, getLegalStatus } = await baaModulePromise

    await expect(
      acceptLegalDocuments({
        customerEntityName: 'Riverside Family Practice, PLLC',
        signerName: 'Jane Admin',
        signerTitle: 'Founder',
        expectedTermsVersion: '2026-04-22.1',
        expectedTermsHash: 'terms-hash',
        expectedBaaVersion: '2026-04-21.1',
        expectedBaaHash: 'baa-hash',
        acceptTerms: true,
        acceptBaa: true,
      }),
    ).rejects.toThrow('Unauthorized')

    await expect(getLegalStatus()).rejects.toThrow('Unauthorized')
  })

  it('rejects non-admin members from managing legal setup', async () => {
    canManageOrganizationMock.mockReturnValue(false)

    const { acceptLegalDocuments, getLegalStatus } = await baaModulePromise

    await expect(
      acceptLegalDocuments({
        customerEntityName: 'Riverside Family Practice, PLLC',
        signerName: 'Jane Admin',
        signerTitle: 'Founder',
        expectedTermsVersion: '2026-04-22.1',
        expectedTermsHash: 'terms-hash',
        expectedBaaVersion: '2026-04-21.1',
        expectedBaaHash: 'baa-hash',
        acceptTerms: true,
        acceptBaa: true,
      }),
    ).rejects.toThrow('Only organization administrators can manage legal setup')

    db = makeLegalDb([
      {
        documentType: 'terms',
        documentVersion: '2026-04-16.1',
        acceptedAt: new Date('2026-04-16T12:00:00.000Z'),
      },
      {
        documentType: 'baa',
        documentVersion: '2026-04-16.1',
        acceptedAt: new Date('2026-04-16T12:00:00.000Z'),
      },
    ])
    getDbMock.mockReturnValue(db)

    await expect(getLegalStatus()).resolves.toEqual(
      expect.objectContaining({
        canManageLegal: false,
        requiresReacceptance: true,
        fullyAccepted: false,
      }),
    )
  })
})

function makeSession(userId: string, organizationId: string | null): AppSession {
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

function makeLegalDb(
  rows: Array<{
    acceptedAt: Date
    documentType: 'terms' | 'baa'
    documentVersion: string
  }> = [],
) {
  return {
    tag: 'db',
    select: vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          orderBy: vi.fn().mockResolvedValue(rows),
        }),
      }),
    }),
  }
}
