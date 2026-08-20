import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { eq } from 'drizzle-orm'
import {
  createTestDB,
  hasContainerRuntime,
  makeMembership,
  makeOrganization,
  makeUser,
  type TestDB,
} from '@phiguard/db/testing'
import { legalAcceptances, memberships, organizations, users } from '@phiguard/db'
import { BaaService } from './service.js'
import { getStandardLegalDocument, hashDocument } from './documents.js'
import { writeAuditEvent } from '@phiguard/audit'

vi.mock('@phiguard/audit', () => ({
  getAuditContext: vi.fn().mockReturnValue({ ip: '203.0.113.10', userAgent: 'Vitest' }),
  writeAuditEvent: vi.fn().mockResolvedValue(undefined),
}))

const describeWithTestDB = hasContainerRuntime() ? describe : describe.skip

describeWithTestDB('BaaService integration signer isolation', () => {
  let testDB: TestDB | undefined

  beforeAll(async () => {
    testDB = await createTestDB()
  }, 120_000)

  afterAll(async () => {
    await testDB?.teardown()
  })

  beforeEach(() => {
    vi.clearAllMocks()
  })

  function requireTestDB(): TestDB {
    if (!testDB) {
      throw new Error('Test database was not initialized')
    }

    return testDB
  }

  async function seedTenant() {
    const { db } = requireTestDB()
    const [org] = await db.insert(organizations).values(makeOrganization()).returning()
    const [user] = await db.insert(users).values(makeUser()).returning()
    await db.insert(memberships).values(makeMembership({ tenantId: org.id, userId: user.id }))

    return { org, user }
  }

  it('does not let a user from another organization accept legal documents', async () => {
    const { db } = requireTestDB()
    const tenantA = await seedTenant()
    const tenantB = await seedTenant()
    const terms = getStandardLegalDocument('terms')
    const baa = getStandardLegalDocument('baa')

    await expect(
      new BaaService().acceptLegalDocuments(
        {
          orgId: tenantA.org.id,
          userId: tenantB.user.id,
          userEmail: tenantB.user.email,
          customerEntityName: 'Riverside Family Practice, PLLC',
          signerName: 'Jane Admin',
          signerTitle: 'Founder',
          acceptedAt: new Date('2026-04-21T10:00:00.000Z'),
          expectedTermsVersion: terms.version,
          expectedTermsHash: hashDocument(terms),
          expectedBaaVersion: baa.version,
          expectedBaaHash: hashDocument(baa),
          executedArtifacts: {},
        },
        db,
      ),
    ).rejects.toThrow('Legal signer is not a member of this organization')

    const acceptanceRows = await db
      .select()
      .from(legalAcceptances)
      .where(eq(legalAcceptances.tenantId, tenantA.org.id))
    expect(acceptanceRows).toEqual([])

    const [currentOrg] = await db
      .select({
        baaSignedAt: organizations.baaSignedAt,
        baaSignedByUserId: organizations.baaSignedByUserId,
        termsAcceptedAt: organizations.termsAcceptedAt,
        termsAcceptedByUserId: organizations.termsAcceptedByUserId,
      })
      .from(organizations)
      .where(eq(organizations.id, tenantA.org.id))
      .limit(1)

    expect(currentOrg).toEqual({
      baaSignedAt: null,
      baaSignedByUserId: null,
      termsAcceptedAt: null,
      termsAcceptedByUserId: null,
    })
    expect(writeAuditEvent).not.toHaveBeenCalled()
  }, 120_000)
})
