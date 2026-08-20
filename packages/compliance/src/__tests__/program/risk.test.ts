import { afterAll, beforeAll, describe, it, expect, vi } from 'vitest'
import {
  createTestDB,
  hasContainerRuntime,
  makeMembership,
  makeOrganization,
  makeUser,
  type TestDB,
} from '@phiguard/db/testing'
import { memberships, organizations, riskAssessments, riskItems, users } from '@phiguard/db'
import { eq } from 'drizzle-orm'
import {
  createRiskItem,
  createRiskAssessment,
  computeRiskScore,
  deleteRiskAssessment,
  deleteRiskItem,
  reopenRiskAssessment,
  renameRiskAssessment,
  summarizeAssessment,
  updateRiskItem,
  updateRiskAssessmentStatus,
} from '../../program/risk.js'

const describeWithTestDB = hasContainerRuntime() ? describe : describe.skip

describeWithTestDB('risk integration tenant and actor isolation', () => {
  let testDB: TestDB | undefined

  beforeAll(async () => {
    testDB = await createTestDB()
  }, 120_000)

  afterAll(async () => {
    await testDB?.teardown()
  })

  function requireTestDB(): TestDB {
    if (!testDB) {
      throw new Error('Test database not initialized')
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

  async function seedAssessment(input?: { status?: 'open' | 'in_review' | 'closed' }) {
    const { db } = requireTestDB()
    const tenant = await seedTenant()
    const [assessment] = await db
      .insert(riskAssessments)
      .values({
        tenantId: tenant.org.id,
        title: 'Annual HIPAA risk assessment',
        status: input?.status ?? 'open',
      })
      .returning()

    return { ...tenant, assessment }
  }

  async function seedRiskItem() {
    const { db } = requireTestDB()
    const seeded = await seedAssessment()
    const [item] = await db
      .insert(riskItems)
      .values({
        assessmentId: seeded.assessment.id,
        category: 'Access Control',
        description: 'Shared privileged account',
        likelihood: 4,
        impact: 5,
        score: 20,
        status: 'critical',
        mitigation: 'Move to named accounts',
      })
      .returning()

    return { ...seeded, item }
  }

  it('rejects risk assessment creation when the actor is not a tenant member', async () => {
    const { db } = requireTestDB()
    const tenantA = await seedTenant()
    const tenantB = await seedTenant()

    await expect(
      createRiskAssessment(db, {
        tenantId: tenantA.org.id,
        actorId: tenantB.user.id,
        title: 'Cross-tenant assessment',
      }),
    ).rejects.toThrow('Risk actor is not a member of this organization')

    const rows = await db
      .select()
      .from(riskAssessments)
      .where(eq(riskAssessments.title, 'Cross-tenant assessment'))
    expect(rows).toEqual([])
  })

  it('rejects risk item creation when the owner is not a tenant member', async () => {
    const { db } = requireTestDB()
    const tenantA = await seedAssessment()
    const tenantB = await seedTenant()

    await expect(
      createRiskItem(db, {
        tenantId: tenantA.org.id,
        actorId: tenantA.user.id,
        assessmentId: tenantA.assessment.id,
        category: 'Access Control',
        description: 'Shared privileged account',
        likelihood: 4,
        impact: 5,
        ownerId: tenantB.user.id,
      }),
    ).rejects.toThrow('Risk owner is not a member of this organization')

    const rows = await db
      .select()
      .from(riskItems)
      .where(eq(riskItems.assessmentId, tenantA.assessment.id))
    expect(rows).toEqual([])
  })

  it('rejects risk item updates when the actor is not a tenant member', async () => {
    const { db } = requireTestDB()
    const tenantA = await seedRiskItem()
    const tenantB = await seedTenant()

    await expect(
      updateRiskItem(db, {
        tenantId: tenantA.org.id,
        actorId: tenantB.user.id,
        itemId: tenantA.item.id,
        category: 'Access Control',
        description: 'Updated shared privileged account',
        likelihood: 2,
        impact: 3,
      }),
    ).rejects.toThrow('Risk actor is not a member of this organization')

    const [current] = await db
      .select()
      .from(riskItems)
      .where(eq(riskItems.id, tenantA.item.id))
      .limit(1)
    expect(current?.score).toBe(20)
  })

  it('rejects risk assessment closure when the actor is not a tenant member', async () => {
    const { db } = requireTestDB()
    const tenantA = await seedAssessment({ status: 'in_review' })
    const tenantB = await seedTenant()

    await expect(
      updateRiskAssessmentStatus(db, {
        tenantId: tenantA.org.id,
        actorId: tenantB.user.id,
        assessmentId: tenantA.assessment.id,
        status: 'closed',
      }),
    ).rejects.toThrow('Risk actor is not a member of this organization')

    const [current] = await db
      .select()
      .from(riskAssessments)
      .where(eq(riskAssessments.id, tenantA.assessment.id))
      .limit(1)
    expect(current?.status).toBe('in_review')
    expect(current?.reviewerId).toBeNull()
  })

  it('rejects risk item deletion when the actor is not a tenant member', async () => {
    const { db } = requireTestDB()
    const tenantA = await seedRiskItem()
    const tenantB = await seedTenant()

    await expect(
      deleteRiskItem(db, {
        tenantId: tenantA.org.id,
        actorId: tenantB.user.id,
        itemId: tenantA.item.id,
      }),
    ).rejects.toThrow('Risk actor is not a member of this organization')

    const [current] = await db
      .select()
      .from(riskItems)
      .where(eq(riskItems.id, tenantA.item.id))
      .limit(1)
    expect(current?.id).toBe(tenantA.item.id)
  })
})

describe('computeRiskScore', () => {
  it('multiplies likelihood by impact', () => {
    expect(computeRiskScore(3, 4)).toBe(12)
    expect(computeRiskScore(5, 5)).toBe(25)
  })

  it('rejects zero likelihood', () => {
    expect(() => computeRiskScore(0, 5)).toThrow('likelihood must be an integer from 1 to 5')
  })

  it('rejects zero impact', () => {
    expect(() => computeRiskScore(5, 0)).toThrow('impact must be an integer from 1 to 5')
  })

  it('rejects non-integer likelihood and impact values', () => {
    expect(() => computeRiskScore(2.5, 3)).toThrow('likelihood must be an integer from 1 to 5')
    expect(() => computeRiskScore(2, 3.5)).toThrow('impact must be an integer from 1 to 5')
  })

  it('rejects values above five', () => {
    expect(() => computeRiskScore(6, 3)).toThrow('likelihood must be an integer from 1 to 5')
    expect(() => computeRiskScore(3, 6)).toThrow('impact must be an integer from 1 to 5')
  })

  it('handles minimum score', () => {
    expect(computeRiskScore(1, 1)).toBe(1)
  })
})

describe('summarizeAssessment', () => {
  it('counts items by risk band', () => {
    const items = [{ score: 25 }, { score: 10 }, { score: 3 }]
    expect(summarizeAssessment(items)).toEqual({ high: 1, medium: 1, low: 1 })
  })

  it('returns all zeros for empty list', () => {
    expect(summarizeAssessment([])).toEqual({ high: 0, medium: 0, low: 0 })
  })

  it('classifies score >= 15 as high', () => {
    expect(summarizeAssessment([{ score: 15 }])).toEqual({ high: 1, medium: 0, low: 0 })
    expect(summarizeAssessment([{ score: 25 }])).toEqual({ high: 1, medium: 0, low: 0 })
  })

  it('classifies score 6-14 as medium', () => {
    expect(summarizeAssessment([{ score: 6 }])).toEqual({ high: 0, medium: 1, low: 0 })
    expect(summarizeAssessment([{ score: 14 }])).toEqual({ high: 0, medium: 1, low: 0 })
  })

  it('classifies score <= 5 as low', () => {
    expect(summarizeAssessment([{ score: 5 }])).toEqual({ high: 0, medium: 0, low: 1 })
    expect(summarizeAssessment([{ score: 1 }])).toEqual({ high: 0, medium: 0, low: 1 })
  })

  it('handles multiple items in the same band', () => {
    const items = [{ score: 20 }, { score: 16 }, { score: 8 }, { score: 4 }]
    expect(summarizeAssessment(items)).toEqual({ high: 2, medium: 1, low: 1 })
  })
})

describe('createRiskItem', () => {
  it('computes score, inserts the item, and writes an audit event', async () => {
    const db = makeCreateRiskItemDb(true)

    await createRiskItem(db as never, {
      tenantId: 'tenant-1',
      actorId: 'user-1',
      assessmentId: 'assessment-1',
      category: 'Access Control',
      description: 'Shared admin account in use',
      likelihood: 4,
      impact: 5,
      mitigation: 'Move each admin to a named account',
      ownerId: 'owner-1',
      dueAt: new Date('2026-07-01T00:00:00.000Z'),
    })

    expect(db.insertValues).toHaveBeenCalledWith(
      expect.objectContaining({
        assessmentId: 'assessment-1',
        likelihood: 4,
        impact: 5,
        score: 20,
        status: 'critical',
      }),
    )
    expect(db.auditValues).toHaveBeenCalledWith(
      expect.objectContaining({
        tenantId: 'tenant-1',
        actorId: 'user-1',
        action: 'risk_item.created',
        resourceType: 'risk_item',
        after: expect.objectContaining({
          assessmentId: 'assessment-1',
          category: 'Access Control',
          score: 20,
          status: 'critical',
        }),
      }),
    )
    expect(JSON.stringify(db.auditValues.mock.calls)).not.toContain('Shared admin account in use')
    expect(JSON.stringify(db.auditValues.mock.calls)).not.toContain('Move each admin')
  })

  it('rejects assessments outside the tenant', async () => {
    const db = makeCreateRiskItemDb(false)

    await expect(
      createRiskItem(db as never, {
        tenantId: 'tenant-1',
        actorId: 'user-1',
        assessmentId: 'assessment-other',
        category: 'Access Control',
        description: 'Shared admin account in use',
        likelihood: 4,
        impact: 5,
      }),
    ).rejects.toThrow('Risk assessment not found')

    expect(db.insertValues).not.toHaveBeenCalled()
    expect(db.auditValues).not.toHaveBeenCalled()
  })

  it('rejects closed assessments without inserting or auditing', async () => {
    const db = makeCreateRiskItemDb(true, { status: 'closed' })

    await expect(
      createRiskItem(db as never, {
        tenantId: 'tenant-1',
        actorId: 'user-1',
        assessmentId: 'assessment-1',
        category: 'Access Control',
        description: 'Shared admin account in use',
        likelihood: 4,
        impact: 5,
      }),
    ).rejects.toThrow('Closed risk assessments cannot be changed')

    expect(db.insertValues).not.toHaveBeenCalled()
    expect(db.auditValues).not.toHaveBeenCalled()
  })

  it('rejects creates when the assessment closes before the transactional insert', async () => {
    const db = makeCreateRiskItemDb(true, { transactionalStatus: 'closed' })

    await expect(
      createRiskItem(db as never, {
        tenantId: 'tenant-1',
        actorId: 'user-1',
        assessmentId: 'assessment-1',
        category: 'Access Control',
        description: 'Shared admin account in use',
        likelihood: 4,
        impact: 5,
      }),
    ).rejects.toThrow('Closed risk assessments cannot be changed')

    expect(db.insertValues).not.toHaveBeenCalled()
    expect(db.auditValues).not.toHaveBeenCalled()
  })
})

describe('createRiskAssessment', () => {
  it('creates a risk assessment without writing title text to audit metadata', async () => {
    const db = makeCreateRiskAssessmentDb()

    await createRiskAssessment(db as never, {
      tenantId: 'tenant-1',
      actorId: 'user-1',
      title: 'Annual HIPAA Risk Assessment for Jane Patient',
    })

    expect(db.insertValues).toHaveBeenCalledWith({
      tenantId: 'tenant-1',
      title: 'Annual HIPAA Risk Assessment for Jane Patient',
    })
    expect(db.auditValues).toHaveBeenCalledWith(
      expect.objectContaining({
        tenantId: 'tenant-1',
        actorId: 'user-1',
        action: 'risk_assessment.created',
        resourceType: 'risk_assessment',
        resourceId: 'assessment-1',
        after: expect.objectContaining({ status: 'open' }),
      }),
    )
    expect(JSON.stringify(db.auditValues.mock.calls)).not.toContain('Jane Patient')
  })
})

describe('deleteRiskItem', () => {
  it('deletes a tenant-owned risk item and writes an audit event', async () => {
    const db = makeDeleteRiskItemDb(true)

    await deleteRiskItem(db as never, {
      tenantId: 'tenant-1',
      actorId: 'user-1',
      itemId: 'risk-item-1',
    })

    expect(db.deleteWhere).toHaveBeenCalled()
    expect(db.auditValues).toHaveBeenCalledWith(
      expect.objectContaining({
        tenantId: 'tenant-1',
        actorId: 'user-1',
        action: 'risk_item.deleted',
        resourceType: 'risk_item',
        resourceId: 'risk-item-1',
      }),
    )
    expect(JSON.stringify(db.auditValues.mock.calls)).not.toContain('Shared admin account in use')
  })

  it('rejects risk items outside the tenant without deleting or writing audit', async () => {
    const db = makeDeleteRiskItemDb(false)

    await expect(
      deleteRiskItem(db as never, {
        tenantId: 'tenant-1',
        actorId: 'user-1',
        itemId: 'risk-item-other',
      }),
    ).rejects.toThrow('Risk item not found')

    expect(db.deleteWhere).not.toHaveBeenCalled()
    expect(db.auditValues).not.toHaveBeenCalled()
  })

  it('rejects risk items on closed assessments without deleting or auditing', async () => {
    const db = makeDeleteRiskItemDb(true, { assessmentStatus: 'closed' })

    await expect(
      deleteRiskItem(db as never, {
        tenantId: 'tenant-1',
        actorId: 'user-1',
        itemId: 'risk-item-1',
      }),
    ).rejects.toThrow('Closed risk assessments cannot be changed')

    expect(db.deleteWhere).not.toHaveBeenCalled()
    expect(db.auditValues).not.toHaveBeenCalled()
  })

  it('does not audit stale deletes when the risk item delete matches no rows', async () => {
    const db = makeDeleteRiskItemDb(true, { deleteReturns: false })

    await expect(
      deleteRiskItem(db as never, {
        tenantId: 'tenant-1',
        actorId: 'user-1',
        itemId: 'risk-item-1',
      }),
    ).rejects.toThrow('Risk item changed before it could be deleted')

    expect(db.deleteWhere).toHaveBeenCalled()
    expect(db.auditValues).not.toHaveBeenCalled()
  })

  it('rejects deletes when the assessment closes before the transactional delete', async () => {
    const db = makeDeleteRiskItemDb(true, { transactionalAssessmentStatus: 'closed' })

    await expect(
      deleteRiskItem(db as never, {
        tenantId: 'tenant-1',
        actorId: 'user-1',
        itemId: 'risk-item-1',
      }),
    ).rejects.toThrow('Closed risk assessments cannot be changed')

    expect(db.deleteWhere).not.toHaveBeenCalled()
    expect(db.auditValues).not.toHaveBeenCalled()
  })
})

describe('updateRiskItem', () => {
  it('updates a tenant risk item, recomputes score, and writes an audit event', async () => {
    const db = makeUpdateRiskItemDb(true)

    await updateRiskItem(db as never, {
      tenantId: 'tenant-1',
      actorId: 'user-1',
      itemId: 'risk-item-1',
      category: 'Access Control',
      description: 'Privileged account review is overdue',
      likelihood: 3,
      impact: 5,
      mitigation: 'Complete quarterly access review',
      dueAt: new Date('2026-07-01T00:00:00.000Z'),
    })

    expect(db.updateSet).toHaveBeenCalledWith(
      expect.objectContaining({
        category: 'Access Control',
        description: 'Privileged account review is overdue',
        likelihood: 3,
        impact: 5,
        score: 15,
        status: 'high',
        mitigation: 'Complete quarterly access review',
      }),
    )
    expect(db.auditValues).toHaveBeenCalledWith(
      expect.objectContaining({
        tenantId: 'tenant-1',
        actorId: 'user-1',
        action: 'risk_item.updated',
        resourceType: 'risk_item',
        resourceId: 'risk-item-1',
        before: expect.objectContaining({ score: 20 }),
        after: expect.objectContaining({ score: 15, status: 'high' }),
      }),
    )
    expect(JSON.stringify(db.auditValues.mock.calls)).not.toContain(
      'Privileged account review is overdue',
    )
    expect(JSON.stringify(db.auditValues.mock.calls)).not.toContain(
      'Complete quarterly access review',
    )
  })

  it('rejects risk items outside the tenant without updating or auditing', async () => {
    const db = makeUpdateRiskItemDb(false)

    await expect(
      updateRiskItem(db as never, {
        tenantId: 'tenant-1',
        actorId: 'user-1',
        itemId: 'risk-item-other',
        category: 'Access Control',
        description: 'Privileged account review is overdue',
        likelihood: 3,
        impact: 5,
      }),
    ).rejects.toThrow('Risk item not found')

    expect(db.updateSet).not.toHaveBeenCalled()
    expect(db.auditValues).not.toHaveBeenCalled()
  })

  it('rejects risk items on closed assessments without updating or auditing', async () => {
    const db = makeUpdateRiskItemDb(true, { assessmentStatus: 'closed' })

    await expect(
      updateRiskItem(db as never, {
        tenantId: 'tenant-1',
        actorId: 'user-1',
        itemId: 'risk-item-1',
        category: 'Access Control',
        description: 'Privileged account review is overdue',
        likelihood: 3,
        impact: 5,
      }),
    ).rejects.toThrow('Closed risk assessments cannot be changed')

    expect(db.updateSet).not.toHaveBeenCalled()
    expect(db.auditValues).not.toHaveBeenCalled()
  })

  it('rejects updates when the assessment closes before the transactional update', async () => {
    const db = makeUpdateRiskItemDb(true, { transactionalAssessmentStatus: 'closed' })

    await expect(
      updateRiskItem(db as never, {
        tenantId: 'tenant-1',
        actorId: 'user-1',
        itemId: 'risk-item-1',
        category: 'Access Control',
        description: 'Privileged account review is overdue',
        likelihood: 3,
        impact: 5,
      }),
    ).rejects.toThrow('Closed risk assessments cannot be changed')

    expect(db.updateSet).not.toHaveBeenCalled()
    expect(db.auditValues).not.toHaveBeenCalled()
  })
})

describe('updateRiskAssessmentStatus', () => {
  it('moves a tenant assessment into review and writes an audit event', async () => {
    const db = makeUpdateRiskAssessmentStatusDb(true)

    await updateRiskAssessmentStatus(db as never, {
      tenantId: 'tenant-1',
      actorId: 'user-1',
      assessmentId: 'assessment-1',
      status: 'in_review',
    })

    expect(db.updateSet).toHaveBeenCalledWith({
      status: 'in_review',
      reviewerId: null,
      reviewedAt: null,
    })
    expect(db.auditValues).toHaveBeenCalledWith(
      expect.objectContaining({
        tenantId: 'tenant-1',
        actorId: 'user-1',
        action: 'risk_assessment.updated',
        resourceType: 'risk_assessment',
        resourceId: 'assessment-1',
        before: expect.objectContaining({ status: 'open' }),
        after: expect.objectContaining({ status: 'in_review' }),
      }),
    )
    expect(JSON.stringify(db.auditValues.mock.calls)).not.toContain(
      'Annual HIPAA Risk Assessment',
    )
  })

  it('closes a tenant assessment with reviewer metadata', async () => {
    const db = makeUpdateRiskAssessmentStatusDb(true, { status: 'in_review' })

    await updateRiskAssessmentStatus(db as never, {
      tenantId: 'tenant-1',
      actorId: 'reviewer-1',
      assessmentId: 'assessment-1',
      status: 'closed',
    })

    expect(db.updateSet).toHaveBeenCalledWith({
      status: 'closed',
      reviewerId: 'reviewer-1',
      reviewedAt: expect.any(Date),
    })
    expect(db.auditValues).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'risk_assessment.reviewed',
        after: expect.objectContaining({ status: 'closed' }),
      }),
    )
  })

  it('does not reopen a closed assessment', async () => {
    const db = makeUpdateRiskAssessmentStatusDb(true, { status: 'closed' })

    await expect(
      updateRiskAssessmentStatus(db as never, {
        tenantId: 'tenant-1',
        actorId: 'user-1',
        assessmentId: 'assessment-1',
        status: 'open',
      }),
    ).rejects.toThrow('Closed risk assessments cannot be reopened')

    expect(db.updateSet).not.toHaveBeenCalled()
    expect(db.auditValues).not.toHaveBeenCalled()
  })

  it('does not rewrite reviewer metadata for an already closed assessment', async () => {
    const db = makeUpdateRiskAssessmentStatusDb(true, { status: 'closed' })

    await expect(
      updateRiskAssessmentStatus(db as never, {
        tenantId: 'tenant-1',
        actorId: 'user-2',
        assessmentId: 'assessment-1',
        status: 'closed',
      }),
    ).rejects.toThrow('Closed risk assessments cannot be changed')

    expect(db.updateSet).not.toHaveBeenCalled()
    expect(db.auditValues).not.toHaveBeenCalled()
  })

  it('requires review before closing an open assessment', async () => {
    const db = makeUpdateRiskAssessmentStatusDb(true)

    await expect(
      updateRiskAssessmentStatus(db as never, {
        tenantId: 'tenant-1',
        actorId: 'user-1',
        assessmentId: 'assessment-1',
        status: 'closed',
      }),
    ).rejects.toThrow('Risk assessment must be in review before it can be closed')

    expect(db.updateSet).not.toHaveBeenCalled()
    expect(db.auditValues).not.toHaveBeenCalled()
  })

  it('does not move an assessment backward from review to open', async () => {
    const db = makeUpdateRiskAssessmentStatusDb(true, { status: 'in_review' })

    await expect(
      updateRiskAssessmentStatus(db as never, {
        tenantId: 'tenant-1',
        actorId: 'user-1',
        assessmentId: 'assessment-1',
        status: 'open',
      }),
    ).rejects.toThrow('Risk assessments cannot move backward from review')

    expect(db.updateSet).not.toHaveBeenCalled()
    expect(db.auditValues).not.toHaveBeenCalled()
  })

  it('rejects assessments outside the tenant without updating or auditing', async () => {
    const db = makeUpdateRiskAssessmentStatusDb(false)

    await expect(
      updateRiskAssessmentStatus(db as never, {
        tenantId: 'tenant-1',
        actorId: 'user-1',
        assessmentId: 'assessment-other',
        status: 'closed',
      }),
    ).rejects.toThrow('Risk assessment not found')

    expect(db.updateSet).not.toHaveBeenCalled()
    expect(db.auditValues).not.toHaveBeenCalled()
  })

  it('does not audit stale status changes when the update matches no rows', async () => {
    const db = makeUpdateRiskAssessmentStatusDb(true, { updateReturns: false })

    await expect(
      updateRiskAssessmentStatus(db as never, {
        tenantId: 'tenant-1',
        actorId: 'user-1',
        assessmentId: 'assessment-1',
        status: 'in_review',
      }),
    ).rejects.toThrow('Risk assessment changed before the status update could be saved')

    expect(db.updateSet).toHaveBeenCalled()
    expect(db.auditValues).not.toHaveBeenCalled()
  })
})

describe('reopenRiskAssessment', () => {
  it('reopens a tenant assessment and writes an audit event', async () => {
    const db = makeReopenRiskAssessmentDb(true, { status: 'closed' })

    await reopenRiskAssessment(db as never, {
      tenantId: 'tenant-1',
      actorId: 'user-1',
      assessmentId: 'assessment-1',
    })

    expect(db.updateSet).toHaveBeenCalledWith({
      status: 'open',
      reviewerId: null,
      reviewedAt: null,
    })
    expect(db.auditValues).toHaveBeenCalledWith(
      expect.objectContaining({
        tenantId: 'tenant-1',
        actorId: 'user-1',
        action: 'risk_assessment.reopened',
        resourceType: 'risk_assessment',
        resourceId: 'assessment-1',
        before: { status: 'closed' },
        after: { status: 'open' },
      }),
    )
  })

  it('rejects assessments outside the tenant without reopening or auditing', async () => {
    const db = makeReopenRiskAssessmentDb(false)

    await expect(
      reopenRiskAssessment(db as never, {
        tenantId: 'tenant-1',
        actorId: 'user-1',
        assessmentId: 'assessment-other',
      }),
    ).rejects.toThrow('Risk assessment not found')

    expect(db.updateSet).not.toHaveBeenCalled()
    expect(db.auditValues).not.toHaveBeenCalled()
  })

  it('does not audit stale reopens when the update matches no rows', async () => {
    const db = makeReopenRiskAssessmentDb(true, { status: 'closed', updateReturns: false })

    await expect(
      reopenRiskAssessment(db as never, {
        tenantId: 'tenant-1',
        actorId: 'user-1',
        assessmentId: 'assessment-1',
      }),
    ).rejects.toThrow('Risk assessment changed before it could be reopened')

    expect(db.updateSet).toHaveBeenCalled()
    expect(db.auditValues).not.toHaveBeenCalled()
  })
})

describe('renameRiskAssessment', () => {
  it('renames a tenant assessment and writes non-sensitive audit metadata', async () => {
    const db = makeRenameRiskAssessmentDb(true)

    await renameRiskAssessment(db as never, {
      tenantId: 'tenant-1',
      actorId: 'user-1',
      assessmentId: 'assessment-1',
      title: 'Updated Risk Assessment',
    })

    expect(db.updateSet).toHaveBeenCalledWith({ title: 'Updated Risk Assessment' })
    expect(db.auditValues).toHaveBeenCalledWith(
      expect.objectContaining({
        tenantId: 'tenant-1',
        actorId: 'user-1',
        action: 'risk_assessment.renamed',
        resourceType: 'risk_assessment',
        resourceId: 'assessment-1',
        before: { titleChanged: false },
        after: { titleChanged: true },
      }),
    )
    expect(JSON.stringify(db.auditValues.mock.calls)).not.toContain('Updated Risk Assessment')
  })

  it('does not audit stale renames when the update matches no rows', async () => {
    const db = makeRenameRiskAssessmentDb(true, { updateReturns: false })

    await expect(
      renameRiskAssessment(db as never, {
        tenantId: 'tenant-1',
        actorId: 'user-1',
        assessmentId: 'assessment-1',
        title: 'Updated Risk Assessment',
      }),
    ).rejects.toThrow('Risk assessment changed before it could be renamed')

    expect(db.updateSet).toHaveBeenCalled()
    expect(db.auditValues).not.toHaveBeenCalled()
  })
})

describe('deleteRiskAssessment', () => {
  it('deletes a tenant assessment and writes an audit event', async () => {
    const db = makeDeleteRiskAssessmentDb(true)

    await deleteRiskAssessment(db as never, {
      tenantId: 'tenant-1',
      actorId: 'user-1',
      assessmentId: 'assessment-1',
    })

    expect(db.deleteWhere).toHaveBeenCalled()
    expect(db.auditValues).toHaveBeenCalledWith(
      expect.objectContaining({
        tenantId: 'tenant-1',
        actorId: 'user-1',
        action: 'risk_assessment.deleted',
        resourceType: 'risk_assessment',
        resourceId: 'assessment-1',
        before: { status: 'open' },
      }),
    )
  })

  it('does not audit stale deletes when the delete matches no rows', async () => {
    const db = makeDeleteRiskAssessmentDb(true, { deleteReturns: false })

    await expect(
      deleteRiskAssessment(db as never, {
        tenantId: 'tenant-1',
        actorId: 'user-1',
        assessmentId: 'assessment-1',
      }),
    ).rejects.toThrow('Risk assessment changed before it could be deleted')

    expect(db.deleteWhere).toHaveBeenCalled()
    expect(db.auditValues).not.toHaveBeenCalled()
  })
})

function makeCreateRiskItemDb(
  assessmentExists: boolean,
  overrides: {
    status?: 'open' | 'in_review' | 'closed'
    transactionalStatus?: 'open' | 'in_review' | 'closed'
  } = {},
) {
  const limit = vi
    .fn()
    .mockResolvedValue(
      assessmentExists ? [{ id: 'assessment-1', status: overrides.status ?? 'open' }] : [],
    )
  const where = vi.fn().mockReturnValue({ limit })
  const from = vi.fn().mockReturnValue({ where })
  const select = vi.fn().mockReturnValue({ from })

  const txLimit = vi.fn().mockResolvedValue(
    assessmentExists
      ? [{ id: 'assessment-1', status: overrides.transactionalStatus ?? overrides.status ?? 'open' }]
      : [],
  )
  const txWhere = vi.fn().mockReturnValue({ limit: txLimit })
  const txFrom = vi.fn().mockReturnValue({ where: txWhere })
  const txSelect = vi.fn().mockReturnValue({ from: txFrom })

  const auditValues = vi.fn().mockResolvedValue(undefined)
  const insertValues = vi.fn().mockReturnValue({
    returning: vi.fn().mockResolvedValue([
      {
        id: 'risk-item-1',
        assessmentId: 'assessment-1',
        category: 'Access Control',
        description: 'Shared admin account in use',
        likelihood: 4,
        impact: 5,
        score: 20,
        status: 'critical',
      },
    ]),
  })

  let insertCall = 0
  const insert = vi.fn(() => {
    insertCall += 1
    return {
      values: insertCall === 1 ? insertValues : auditValues,
    }
  })

  return {
    select,
    insert,
    transaction: vi.fn(async (fn) => fn({ select: txSelect, insert })),
    insertValues,
    auditValues,
  }
}

function makeCreateRiskAssessmentDb() {
  const created = {
    id: 'assessment-1',
    tenantId: 'tenant-1',
    title: 'Annual HIPAA Risk Assessment',
    status: 'open',
    reviewerId: null,
    reviewedAt: null,
  }
  const insertValues = vi.fn().mockReturnValue({
    returning: vi.fn().mockResolvedValue([created]),
  })
  const auditValues = vi.fn().mockResolvedValue(undefined)
  let insertCall = 0
  const insert = vi.fn(() => {
    insertCall += 1
    return {
      values: insertCall === 1 ? insertValues : auditValues,
    }
  })
  const select = vi.fn().mockReturnValue({
    from: vi.fn().mockReturnValue({
      where: vi.fn().mockReturnValue({
        limit: vi.fn().mockResolvedValue([{ id: 'membership-1' }]),
      }),
    }),
  })

  return {
    select,
    insert,
    transaction: vi.fn(async (fn) => fn({ insert, select })),
    insertValues,
    auditValues,
  }
}

function makeDeleteRiskItemDb(
  itemExists: boolean,
  overrides: {
    assessmentStatus?: 'open' | 'in_review' | 'closed'
    transactionalAssessmentStatus?: 'open' | 'in_review' | 'closed'
    deleteReturns?: boolean
  } = {},
) {
  const current = {
    id: 'risk-item-1',
    assessmentId: 'assessment-1',
    assessmentStatus: overrides.assessmentStatus ?? 'open',
    category: 'Access Control',
    description: 'Shared admin account in use',
    likelihood: 4,
    impact: 5,
    score: 20,
    status: 'critical',
  }
  const limit = vi.fn().mockResolvedValue(itemExists ? [current] : [])
  const where = vi.fn().mockReturnValue({ limit })
  const innerJoin = vi.fn().mockReturnValue({ where })
  const from = vi.fn().mockReturnValue({ innerJoin })
  const select = vi.fn().mockReturnValue({ from })

  const txCurrent = {
    id: current.id,
    assessmentStatus: overrides.transactionalAssessmentStatus ?? current.assessmentStatus,
  }
  const txLimit = vi.fn().mockResolvedValue(itemExists ? [txCurrent] : [])
  const txWhere = vi.fn().mockReturnValue({ limit: txLimit })
  const txInnerJoin = vi.fn().mockReturnValue({ where: txWhere })
  const txFrom = vi.fn().mockReturnValue({ innerJoin: txInnerJoin })
  const txSelect = vi.fn().mockReturnValue({ from: txFrom })
  const membershipLimit = vi.fn().mockResolvedValue([{ id: 'membership-1' }])
  const membershipWhere = vi.fn().mockReturnValue({ limit: membershipLimit })
  const membershipFrom = vi.fn().mockReturnValue({ where: membershipWhere })
  select.mockReturnValueOnce({ from }).mockReturnValue({ from: membershipFrom })

  const deleteWhere = vi.fn().mockReturnValue({
    returning: vi
      .fn()
      .mockResolvedValue(overrides.deleteReturns === false ? [] : [{ id: current.id }]),
  })
  const deleteFn = vi.fn().mockReturnValue({ where: deleteWhere })

  const auditValues = vi.fn().mockResolvedValue(undefined)
  const insert = vi.fn(() => ({ values: auditValues }))

  return {
    select,
    delete: deleteFn,
    insert,
    transaction: vi.fn(async (fn) => fn({ select: txSelect, delete: deleteFn, insert })),
    deleteWhere,
    auditValues,
  }
}

function makeUpdateRiskItemDb(
  itemExists: boolean,
  overrides: {
    assessmentStatus?: 'open' | 'in_review' | 'closed'
    transactionalAssessmentStatus?: 'open' | 'in_review' | 'closed'
  } = {},
) {
  const current = {
    id: 'risk-item-1',
    assessmentId: 'assessment-1',
    assessmentStatus: overrides.assessmentStatus ?? 'open',
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
  const limit = vi.fn().mockResolvedValue(itemExists ? [current] : [])
  const where = vi.fn().mockReturnValue({ limit })
  const innerJoin = vi.fn().mockReturnValue({ where })
  const from = vi.fn().mockReturnValue({ innerJoin })
  const select = vi.fn().mockReturnValue({ from })

  const txCurrent = {
    id: current.id,
    assessmentStatus: overrides.transactionalAssessmentStatus ?? current.assessmentStatus,
  }
  const txLimit = vi.fn().mockResolvedValue(itemExists ? [txCurrent] : [])
  const txWhere = vi.fn().mockReturnValue({ limit: txLimit })
  const txInnerJoin = vi.fn().mockReturnValue({ where: txWhere })
  const txFrom = vi.fn().mockReturnValue({ innerJoin: txInnerJoin })
  const txSelect = vi.fn().mockReturnValue({ from: txFrom })
  const membershipLimit = vi.fn().mockResolvedValue([{ id: 'membership-1' }])
  const membershipWhere = vi.fn().mockReturnValue({ limit: membershipLimit })
  const membershipFrom = vi.fn().mockReturnValue({ where: membershipWhere })
  select.mockReturnValueOnce({ from }).mockReturnValue({ from: membershipFrom })

  const updateSet = vi.fn((updates) => ({
    where: vi.fn().mockReturnValue({
      returning: vi.fn().mockResolvedValue([{ ...current, ...updates }]),
    }),
  }))
  const update = vi.fn().mockReturnValue({ set: updateSet })

  const auditValues = vi.fn().mockResolvedValue(undefined)
  const insert = vi.fn(() => ({ values: auditValues }))

  return {
    select,
    update,
    insert,
    transaction: vi.fn(async (fn) => fn({ select: txSelect, update, insert })),
    updateSet,
    auditValues,
  }
}

function makeUpdateRiskAssessmentStatusDb(
  assessmentExists: boolean,
  overrides: { status?: 'open' | 'in_review' | 'closed'; updateReturns?: boolean } = {},
) {
  const current = {
    id: 'assessment-1',
    tenantId: 'tenant-1',
    title: 'Annual HIPAA Risk Assessment',
    status: overrides.status ?? 'open',
    reviewerId: null,
    reviewedAt: null,
  }
  const limit = vi.fn().mockResolvedValue(assessmentExists ? [current] : [])
  const where = vi.fn().mockReturnValue({ limit })
  const from = vi.fn().mockReturnValue({ where })
  const select = vi.fn().mockReturnValue({ from })

  const updateSet = vi.fn((updates) => ({
    where: vi.fn().mockReturnValue({
      returning: vi
        .fn()
        .mockResolvedValue(overrides.updateReturns === false ? [] : [{ ...current, ...updates }]),
    }),
  }))
  const update = vi.fn().mockReturnValue({ set: updateSet })

  const auditValues = vi.fn().mockResolvedValue(undefined)
  const insert = vi.fn(() => ({ values: auditValues }))

  return {
    select,
    update,
    insert,
    transaction: vi.fn(async (fn) => fn({ update, insert })),
    updateSet,
    auditValues,
  }
}

function makeReopenRiskAssessmentDb(
  assessmentExists: boolean,
  overrides: { status?: 'open' | 'in_review' | 'closed'; updateReturns?: boolean } = {},
) {
  const current = {
    id: 'assessment-1',
    tenantId: 'tenant-1',
    title: 'Annual HIPAA Risk Assessment',
    status: overrides.status ?? 'closed',
    reviewerId: 'reviewer-1',
    reviewedAt: new Date('2026-05-01T00:00:00.000Z'),
  }
  const limit = vi.fn().mockResolvedValue(assessmentExists ? [current] : [])
  const where = vi.fn().mockReturnValue({ limit })
  const from = vi.fn().mockReturnValue({ where })
  const select = vi.fn().mockReturnValue({ from })

  const updateSet = vi.fn((updates) => ({
    where: vi.fn().mockReturnValue({
      returning: vi
        .fn()
        .mockResolvedValue(overrides.updateReturns === false ? [] : [{ ...current, ...updates }]),
    }),
  }))
  const update = vi.fn().mockReturnValue({ set: updateSet })

  const auditValues = vi.fn().mockResolvedValue(undefined)
  const insert = vi.fn(() => ({ values: auditValues }))

  return {
    select,
    update,
    insert,
    transaction: vi.fn(async (fn) => fn({ update, insert })),
    updateSet,
    auditValues,
  }
}

function makeRenameRiskAssessmentDb(
  assessmentExists: boolean,
  overrides: { status?: 'open' | 'in_review' | 'closed'; updateReturns?: boolean } = {},
) {
  const current = {
    id: 'assessment-1',
    tenantId: 'tenant-1',
    title: 'Annual HIPAA Risk Assessment',
    status: overrides.status ?? 'open',
    reviewerId: null,
    reviewedAt: null,
  }
  const limit = vi.fn().mockResolvedValue(assessmentExists ? [current] : [])
  const where = vi.fn().mockReturnValue({ limit })
  const from = vi.fn().mockReturnValue({ where })
  const select = vi.fn().mockReturnValue({ from })

  const updateSet = vi.fn((updates) => ({
    where: vi.fn().mockReturnValue({
      returning: vi
        .fn()
        .mockResolvedValue(overrides.updateReturns === false ? [] : [{ ...current, ...updates }]),
    }),
  }))
  const update = vi.fn().mockReturnValue({ set: updateSet })

  const auditValues = vi.fn().mockResolvedValue(undefined)
  const insert = vi.fn(() => ({ values: auditValues }))

  return {
    select,
    update,
    insert,
    transaction: vi.fn(async (fn) => fn({ update, insert })),
    updateSet,
    auditValues,
  }
}

function makeDeleteRiskAssessmentDb(
  assessmentExists: boolean,
  overrides: {
    status?: 'open' | 'in_review' | 'closed'
    deleteReturns?: boolean
  } = {},
) {
  const current = {
    id: 'assessment-1',
    tenantId: 'tenant-1',
    title: 'Annual HIPAA Risk Assessment',
    status: overrides.status ?? 'open',
    reviewerId: null,
    reviewedAt: null,
  }
  const limit = vi.fn().mockResolvedValue(assessmentExists ? [current] : [])
  const where = vi.fn().mockReturnValue({ limit })
  const from = vi.fn().mockReturnValue({ where })
  const select = vi.fn().mockReturnValue({ from })

  const deleteWhere = vi.fn().mockReturnValue({
    returning: vi
      .fn()
      .mockResolvedValue(overrides.deleteReturns === false ? [] : [{ id: current.id }]),
  })
  const deleteFn = vi.fn().mockReturnValue({ where: deleteWhere })

  const auditValues = vi.fn().mockResolvedValue(undefined)
  const insert = vi.fn(() => ({ values: auditValues }))

  return {
    select,
    delete: deleteFn,
    insert,
    transaction: vi.fn(async (fn) => fn({ delete: deleteFn, insert })),
    deleteWhere,
    auditValues,
  }
}
