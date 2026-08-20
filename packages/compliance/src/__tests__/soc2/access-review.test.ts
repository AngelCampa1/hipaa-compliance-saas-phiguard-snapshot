import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { and, eq } from 'drizzle-orm'
import { openAccessReview, recordDecision, closeAccessReview } from '../../soc2/access-review.js'
import { writeAuditEvent } from '@phiguard/audit'
import {
  accessReviewItems,
  accessReviews,
  locationGrants,
  locations,
  memberships,
  organizations,
  users,
} from '@phiguard/db'
import {
  createTestDB,
  hasContainerRuntime,
  makeMembership,
  makeOrganization,
  makeUser,
  type TestDB,
} from '@phiguard/db/testing'

type AccessReviewDb = Parameters<typeof openAccessReview>[0]
const describeWithTestDB = hasContainerRuntime() ? describe : describe.skip

vi.mock('@phiguard/audit', () => ({
  writeAuditEvent: vi.fn().mockResolvedValue(undefined),
  withAuditContext: vi.fn(),
  getAuditContext: vi.fn().mockReturnValue({ actorId: 'actor-123' }),
  logger: { error: vi.fn(), info: vi.fn(), safe: vi.fn() },
}))

describe('openAccessReview', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('creates a review and one item per active membership inside a transaction', async () => {
    const memberships = [{ id: 'mbr-1' }, { id: 'mbr-2' }, { id: 'mbr-3' }]

    const reviewId = 'review-id-1'
    const actorMembershipQuery = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([{ id: 'actor-membership' }]),
    }
    const activeMembershipsQuery = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockResolvedValue(memberships),
    }

    const insertReviewChain = {
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([{ id: reviewId }]),
      }),
    }
    const insertItemsChain = {
      values: vi.fn().mockResolvedValue(undefined),
    }

    let insertCallCount = 0
    const tx = {
      select: vi.fn().mockReturnValueOnce(actorMembershipQuery).mockReturnValue(activeMembershipsQuery),
      insert: vi.fn().mockImplementation(() => {
        insertCallCount++
        return insertCallCount === 1 ? insertReviewChain : insertItemsChain
      }),
    }
    const mockDb = {
      transaction: vi
        .fn()
        .mockImplementation(async (fn: (currentTx: typeof tx) => Promise<{ reviewId: string }>) =>
          fn(tx),
        ),
    }

    const result = await openAccessReview(mockDb as unknown as AccessReviewDb, {
      tenantId: 'tenant-1',
      actorId: 'user-1',
      periodStart: new Date('2026-01-01'),
      periodEnd: new Date('2026-03-31'),
    })

    expect(result.reviewId).toBe(reviewId)
    expect(mockDb.transaction).toHaveBeenCalledTimes(1)
    expect(tx.insert).toHaveBeenCalledTimes(2)
    expect(insertItemsChain.values).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ membershipId: 'mbr-1', reviewId }),
        expect.objectContaining({ membershipId: 'mbr-2', reviewId }),
        expect.objectContaining({ membershipId: 'mbr-3', reviewId }),
      ]),
    )
    expect(writeAuditEvent).toHaveBeenCalledWith(
      tx,
      expect.objectContaining({
        tenantId: 'tenant-1',
        actorId: 'user-1',
        action: 'access_review.opened',
        resourceType: 'access_review',
        resourceId: reviewId,
        after: expect.objectContaining({ status: 'open', itemCount: 3 }),
      }),
    )
  })

  it('rolls back the header if item insertion fails', async () => {
    const memberships = [{ id: 'mbr-1' }]
    const reviewId = 'review-id-rollback'
    const actorMembershipQuery = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([{ id: 'actor-membership' }]),
    }
    const activeMembershipsQuery = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockResolvedValue(memberships),
    }

    const committedReviewHeaders: Array<{ id: string; tenantId: string }> = []
    const stagedReviewHeaders: Array<{ id: string; tenantId: string }> = []

    const insertReviewChain = {
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockImplementation(async () => {
          const reviewHeader = { id: reviewId, tenantId: 'tenant-1' }
          stagedReviewHeaders.push(reviewHeader)
          return [reviewHeader]
        }),
      }),
    }
    const insertItemsChain = {
      values: vi.fn().mockRejectedValue(new Error('item insert failed')),
    }

    let insertCallCount = 0
    const tx = {
      select: vi.fn().mockReturnValueOnce(actorMembershipQuery).mockReturnValue(activeMembershipsQuery),
      insert: vi.fn().mockImplementation(() => {
        insertCallCount++
        return insertCallCount === 1 ? insertReviewChain : insertItemsChain
      }),
    }
    const mockDb = {
      transaction: vi
        .fn()
        .mockImplementation(async (fn: (currentTx: typeof tx) => Promise<{ reviewId: string }>) => {
          try {
            const result = await fn(tx)
            committedReviewHeaders.push(...stagedReviewHeaders)
            stagedReviewHeaders.length = 0
            return result
          } catch (error) {
            stagedReviewHeaders.length = 0
            throw error
          }
        }),
    }

    await expect(
      openAccessReview(mockDb as unknown as AccessReviewDb, {
        tenantId: 'tenant-1',
        actorId: 'user-1',
        periodStart: new Date('2026-01-01'),
        periodEnd: new Date('2026-03-31'),
      }),
    ).rejects.toThrow('item insert failed')

    expect(mockDb.transaction).toHaveBeenCalledTimes(1)
    expect(committedReviewHeaders).toEqual([])
    expect(stagedReviewHeaders).toEqual([])
    expect(insertReviewChain.values).toHaveBeenCalled()
    expect(insertItemsChain.values).toHaveBeenCalled()
  })

  it('rolls back the review if the open audit event fails', async () => {
    const memberships = [{ id: 'mbr-1' }]
    const reviewId = 'review-id-audit-rollback'
    const actorMembershipQuery = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([{ id: 'actor-membership' }]),
    }
    const activeMembershipsQuery = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockResolvedValue(memberships),
    }
    const insertReviewChain = {
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([{ id: reviewId }]),
      }),
    }
    const insertItemsChain = { values: vi.fn().mockResolvedValue(undefined) }
    let insertCallCount = 0
    const tx = {
      select: vi.fn().mockReturnValueOnce(actorMembershipQuery).mockReturnValue(activeMembershipsQuery),
      insert: vi.fn().mockImplementation(() => {
        insertCallCount += 1
        return insertCallCount === 1 ? insertReviewChain : insertItemsChain
      }),
    }
    const mockDb = {
      transaction: vi
        .fn()
        .mockImplementation(async (fn: (currentTx: typeof tx) => Promise<{ reviewId: string }>) =>
          fn(tx),
        ),
    }
    vi.mocked(writeAuditEvent).mockRejectedValueOnce(new Error('audit write failed'))

    await expect(
      openAccessReview(mockDb as unknown as AccessReviewDb, {
        tenantId: 'tenant-1',
        actorId: 'user-1',
        periodStart: new Date('2026-01-01'),
        periodEnd: new Date('2026-03-31'),
      }),
    ).rejects.toThrow('audit write failed')

    expect(mockDb.transaction).toHaveBeenCalledTimes(1)
    expect(insertReviewChain.values).toHaveBeenCalled()
    expect(insertItemsChain.values).toHaveBeenCalled()
  })

  it('rejects access review periods that end before they start', async () => {
    const mockDb = {
      transaction: vi.fn(),
    }

    await expect(
      openAccessReview(mockDb as unknown as AccessReviewDb, {
        tenantId: 'tenant-1',
        actorId: 'user-1',
        periodStart: new Date('2026-04-01'),
        periodEnd: new Date('2026-03-31'),
      }),
    ).rejects.toThrow('Access review period end must be on or after period start')

    expect(mockDb.transaction).not.toHaveBeenCalled()
  })

  it('rejects invalid access review period dates before opening a transaction', async () => {
    const mockDb = {
      transaction: vi.fn(),
    }

    await expect(
      openAccessReview(mockDb as unknown as AccessReviewDb, {
        tenantId: 'tenant-1',
        actorId: 'user-1',
        periodStart: new Date('not-a-date'),
        periodEnd: new Date('2026-03-31'),
      }),
    ).rejects.toThrow('Access review period dates must be valid')

    expect(mockDb.transaction).not.toHaveBeenCalled()
  })

  it('rejects invalid access review period end dates before opening a transaction', async () => {
    const mockDb = {
      transaction: vi.fn(),
    }

    await expect(
      openAccessReview(mockDb as unknown as AccessReviewDb, {
        tenantId: 'tenant-1',
        actorId: 'user-1',
        periodStart: new Date('2026-01-01'),
        periodEnd: new Date('not-a-date'),
      }),
    ).rejects.toThrow('Access review period dates must be valid')

    expect(mockDb.transaction).not.toHaveBeenCalled()
  })
})

describe('recordDecision', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('updates decision on item and writes audit event', async () => {
    const reviewQuery = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([{ id: 'review-1', status: 'open' }]),
    }
    const itemQuery = {
      from: vi.fn().mockReturnThis(),
      leftJoin: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([
        {
          id: 'item-1',
          membershipId: 'mbr-1',
          membershipTenantId: 'tenant-1',
        },
      ]),
    }
    const lockedReviewQuery = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      for: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([{ id: 'review-1', status: 'open' }]),
    }
    const txUpdateChain = {
      set: vi.fn().mockReturnThis(),
      where: vi.fn().mockResolvedValue([{ id: 'item-1', decision: 'keep' }]),
    }
    const tx = {
      select: vi.fn().mockReturnValue(lockedReviewQuery),
      update: vi.fn().mockReturnValue(txUpdateChain),
    }
    let selectCallCount = 0
    const mockDb = {
      select: vi.fn().mockImplementation(() => {
        selectCallCount += 1
        return selectCallCount === 1 ? reviewQuery : itemQuery
      }),
      transaction: vi
        .fn()
        .mockImplementation(async (fn: (t: typeof tx) => Promise<void>) => fn(tx)),
    }

    await recordDecision(mockDb as unknown as AccessReviewDb, {
      reviewId: 'review-1',
      itemId: 'item-1',
      decision: 'keep',
      notes: 'Still valid',
      actorId: 'user-1',
      tenantId: 'tenant-1',
    })

    expect(mockDb.select).toHaveBeenCalled()
    expect(mockDb.transaction).toHaveBeenCalled()
    expect(tx.select).toHaveBeenCalled()
    expect(tx.update).toHaveBeenCalled()
    expect(writeAuditEvent).toHaveBeenCalledWith(
      tx,
      expect.objectContaining({
        action: 'access_review.decision_recorded',
        resourceId: 'item-1',
      }),
    )
  })

  it('does not audit keep decisions when the item update is stale', async () => {
    const reviewQuery = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([{ id: 'review-1', status: 'open' }]),
    }
    const itemQuery = {
      from: vi.fn().mockReturnThis(),
      leftJoin: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([
        {
          id: 'item-1',
          membershipId: 'mbr-1',
          membershipTenantId: 'tenant-1',
        },
      ]),
    }
    const lockedReviewQuery = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      for: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([{ id: 'review-1', status: 'open' }]),
    }
    const txUpdateChain = {
      set: vi.fn().mockReturnThis(),
      where: vi.fn().mockResolvedValue([]),
    }
    const tx = {
      select: vi.fn().mockReturnValue(lockedReviewQuery),
      update: vi.fn().mockReturnValue(txUpdateChain),
    }
    let selectCallCount = 0
    const mockDb = {
      select: vi.fn().mockImplementation(() => {
        selectCallCount += 1
        return selectCallCount === 1 ? reviewQuery : itemQuery
      }),
      transaction: vi
        .fn()
        .mockImplementation(async (fn: (t: typeof tx) => Promise<void>) => fn(tx)),
    }
    await expect(
      recordDecision(mockDb as unknown as AccessReviewDb, {
        reviewId: 'review-1',
        itemId: 'item-1',
        decision: 'keep',
        notes: '',
        actorId: 'user-1',
        tenantId: 'tenant-1',
      }),
    ).rejects.toThrow('Access review item not found')
    // transaction wrapper propagated the error - in a real DB this rolls back the item update
    expect(writeAuditEvent).not.toHaveBeenCalled()
    expect(mockDb.transaction).toHaveBeenCalled()
  })

  it('keep path: audit write failure rolls back item update', async () => {
    const reviewQuery = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([{ id: 'review-1', status: 'open' }]),
    }
    const itemQuery = {
      from: vi.fn().mockReturnThis(),
      leftJoin: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([
        {
          id: 'item-1',
          membershipId: 'mbr-1',
          membershipTenantId: 'tenant-1',
        },
      ]),
    }
    const lockedReviewQuery = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      for: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([{ id: 'review-1', status: 'open' }]),
    }
    const txUpdateChain = {
      set: vi.fn().mockReturnThis(),
      where: vi.fn().mockResolvedValue([{ id: 'item-1' }]),
    }
    const tx = {
      select: vi.fn().mockReturnValue(lockedReviewQuery),
      update: vi.fn().mockReturnValue(txUpdateChain),
    }
    let selectCallCount = 0
    const mockDb = {
      select: vi.fn().mockImplementation(() => {
        selectCallCount += 1
        return selectCallCount === 1 ? reviewQuery : itemQuery
      }),
      transaction: vi
        .fn()
        .mockImplementation(async (fn: (t: typeof tx) => Promise<void>) => fn(tx)),
    }
    vi.mocked(writeAuditEvent).mockRejectedValueOnce(new Error('audit write failed'))

    await expect(
      recordDecision(mockDb as unknown as AccessReviewDb, {
        reviewId: 'review-1',
        itemId: 'item-1',
        decision: 'keep',
        notes: '',
        actorId: 'user-1',
        tenantId: 'tenant-1',
      }),
    ).rejects.toThrow('audit write failed')

    expect(mockDb.transaction).toHaveBeenCalled()
  })

  it('rejects a stale open review once the transaction rechecks the locked row', async () => {
    const reviewQuery = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([{ id: 'review-1', status: 'open' }]),
    }
    const itemQuery = {
      from: vi.fn().mockReturnThis(),
      leftJoin: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([
        {
          id: 'item-1',
          membershipId: 'mbr-1',
          membershipTenantId: 'tenant-1',
        },
      ]),
    }
    const lockedReviewQuery = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      for: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([{ id: 'review-1', status: 'closed' }]),
    }
    const tx = {
      select: vi.fn().mockReturnValue(lockedReviewQuery),
      update: vi.fn(),
      delete: vi.fn(),
    }
    let selectCallCount = 0
    const mockDb = {
      select: vi.fn().mockImplementation(() => {
        selectCallCount += 1
        return selectCallCount === 1 ? reviewQuery : itemQuery
      }),
      transaction: vi
        .fn()
        .mockImplementation(async (fn: (t: typeof tx) => Promise<void>) => fn(tx)),
    }

    await expect(
      recordDecision(mockDb as unknown as AccessReviewDb, {
        reviewId: 'review-1',
        itemId: 'item-1',
        decision: 'keep',
        notes: '',
        actorId: 'user-1',
        tenantId: 'tenant-1',
      }),
    ).rejects.toThrow('Access review is already closed')

    expect(mockDb.transaction).toHaveBeenCalledTimes(1)
    expect(tx.update).not.toHaveBeenCalled()
    expect(tx.delete).not.toHaveBeenCalled()
    expect(writeAuditEvent).not.toHaveBeenCalled()
  })

  it('rejects an already-decided item after locking it inside the transaction', async () => {
    const reviewQuery = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([{ id: 'review-1', status: 'open' }]),
    }
    const itemQuery = {
      from: vi.fn().mockReturnThis(),
      leftJoin: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([
        {
          id: 'item-1',
          membershipId: 'mbr-1',
          membershipTenantId: 'tenant-1',
          decision: null,
        },
      ]),
    }
    const lockedReviewQuery = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      for: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([{ id: 'review-1', status: 'open' }]),
    }
    const lockedItemQuery = {
      from: vi.fn().mockReturnThis(),
      leftJoin: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      for: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([
        {
          id: 'item-1',
          membershipId: 'mbr-1',
          membershipTenantId: 'tenant-1',
          decision: 'keep',
        },
      ]),
    }
    let txSelectCallCount = 0
    const tx = {
      select: vi.fn().mockImplementation(() => {
        txSelectCallCount += 1
        return txSelectCallCount === 1 ? lockedReviewQuery : lockedItemQuery
      }),
      update: vi.fn(),
      delete: vi.fn(),
    }
    let selectCallCount = 0
    const mockDb = {
      select: vi.fn().mockImplementation(() => {
        selectCallCount += 1
        return selectCallCount === 1 ? reviewQuery : itemQuery
      }),
      transaction: vi
        .fn()
        .mockImplementation(async (fn: (t: typeof tx) => Promise<void>) => fn(tx)),
    }

    await expect(
      recordDecision(mockDb as unknown as AccessReviewDb, {
        reviewId: 'review-1',
        itemId: 'item-1',
        decision: 'revoke',
        notes: 'Second decision should be rejected',
        actorId: 'user-1',
        tenantId: 'tenant-1',
      }),
    ).rejects.toThrow('Access review item already has a decision')

    expect(mockDb.transaction).toHaveBeenCalledTimes(1)
    expect(tx.update).not.toHaveBeenCalled()
    expect(tx.delete).not.toHaveBeenCalled()
    expect(writeAuditEvent).not.toHaveBeenCalled()
  })

  it('throws when review not found for tenant', async () => {
    const selectChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([]), // no review found for this tenant
    }
    const mockDb = {
      select: vi.fn().mockReturnValue(selectChain),
    }

    await expect(
      recordDecision(mockDb as unknown as AccessReviewDb, {
        reviewId: 'review-other-tenant',
        itemId: 'item-1',
        decision: 'keep',
        notes: '',
        actorId: 'user-1',
        tenantId: 'tenant-1',
      }),
    ).rejects.toThrow('Access review not found')
  })

  it('throws when review is already closed', async () => {
    const selectChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([{ id: 'review-1', status: 'closed' }]),
    }
    const mockDb = {
      select: vi.fn().mockReturnValue(selectChain),
    }

    await expect(
      recordDecision(mockDb as unknown as AccessReviewDb, {
        reviewId: 'review-1',
        itemId: 'item-1',
        decision: 'keep',
        notes: '',
        actorId: 'user-1',
        tenantId: 'tenant-1',
      }),
    ).rejects.toThrow('Access review is already closed')
  })

  it('throws when item does not belong to the tenant-scoped review', async () => {
    let selectCallCount = 0
    const mockDb = {
      select: vi.fn().mockImplementation(() => {
        selectCallCount += 1
        if (selectCallCount === 1) {
          return {
            from: vi.fn().mockReturnThis(),
            where: vi.fn().mockReturnThis(),
            limit: vi.fn().mockResolvedValue([{ id: 'review-1', status: 'open' }]),
          }
        }
        if (selectCallCount === 2) {
          return {
            from: vi.fn().mockReturnThis(),
            where: vi.fn().mockReturnThis(),
            limit: vi.fn().mockResolvedValue([{ id: 'membership-1' }]),
          }
        }

        return {
          from: vi.fn().mockReturnThis(),
          leftJoin: vi.fn().mockReturnThis(),
          where: vi.fn().mockReturnThis(),
          limit: vi.fn().mockResolvedValue([]),
        }
      }),
    }

    await expect(
      recordDecision(mockDb as unknown as AccessReviewDb, {
        reviewId: 'review-1',
        itemId: 'item-foreign',
        decision: 'revoke',
        notes: 'Remove access',
        actorId: 'user-1',
        tenantId: 'tenant-1',
      }),
    ).rejects.toThrow('Access review item not found')
  })

  it('deletes membership when decision is revoke (inside transaction)', async () => {
    const reviewQuery = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([{ id: 'review-1', status: 'open' }]),
    }
    const itemQuery = {
      from: vi.fn().mockReturnThis(),
      leftJoin: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([
        {
          id: 'item-1',
          membershipId: 'mbr-5',
          membershipTenantId: 'tenant-1',
        },
      ]),
    }
    const lockedReviewQuery = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      for: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([{ id: 'review-1', status: 'open' }]),
    }
    const txDeleteChain = { where: vi.fn().mockResolvedValue(undefined) }
    const txUpdateChain = {
      set: vi.fn().mockReturnThis(),
      where: vi.fn().mockResolvedValue([{ id: 'item-1' }]),
    }
    const tx = {
      select: vi.fn().mockReturnValue(lockedReviewQuery),
      delete: vi.fn().mockReturnValue(txDeleteChain),
      update: vi.fn().mockReturnValue(txUpdateChain),
    }
    let selectCallCount = 0
    const mockDb = {
      select: vi.fn().mockImplementation(() => {
        selectCallCount += 1
        return selectCallCount === 1 ? reviewQuery : itemQuery
      }),
      transaction: vi
        .fn()
        .mockImplementation(async (fn: (t: typeof tx) => Promise<void>) => fn(tx)),
    }

    await recordDecision(mockDb as unknown as AccessReviewDb, {
      reviewId: 'review-1',
      itemId: 'item-1',
      decision: 'revoke',
      notes: 'Remove access',
      actorId: 'user-1',
      tenantId: 'tenant-1',
    })

    expect(mockDb.transaction).toHaveBeenCalled()
    expect(tx.select).toHaveBeenCalled()
    expect(tx.delete).toHaveBeenCalled()
    expect(writeAuditEvent).toHaveBeenCalledWith(
      tx,
      expect.objectContaining({ action: 'membership.revoked' }),
    )
  })

  it('does not revoke organization owners through an access review', async () => {
    const reviewQuery = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([{ id: 'review-1', status: 'open' }]),
    }
    const itemQuery = {
      from: vi.fn().mockReturnThis(),
      leftJoin: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([
        {
          id: 'item-owner',
          membershipId: 'mbr-owner',
          membershipTenantId: 'tenant-1',
          membershipRole: 'org_owner',
        },
      ]),
    }
    const lockedReviewQuery = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      for: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([{ id: 'review-1', status: 'open' }]),
    }
    const lockedItemQuery = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      for: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([{ id: 'item-owner', decision: null }]),
    }
    const lockedMembershipQuery = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      for: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([{ id: 'mbr-owner', role: 'org_owner' }]),
    }
    let txSelectCallCount = 0
    const tx = {
      select: vi.fn().mockImplementation(() => {
        txSelectCallCount += 1
        if (txSelectCallCount === 1) return lockedReviewQuery
        if (txSelectCallCount === 2) return lockedItemQuery
        return lockedMembershipQuery
      }),
      delete: vi.fn(),
      update: vi.fn(),
    }
    let selectCallCount = 0
    const mockDb = {
      select: vi.fn().mockImplementation(() => {
        selectCallCount += 1
        return selectCallCount === 1 ? reviewQuery : itemQuery
      }),
      transaction: vi
        .fn()
        .mockImplementation(async (fn: (t: typeof tx) => Promise<void>) => fn(tx)),
    }

    await expect(
      recordDecision(mockDb as unknown as AccessReviewDb, {
        reviewId: 'review-1',
        itemId: 'item-owner',
        decision: 'revoke',
        notes: 'Remove access',
        actorId: 'user-1',
        tenantId: 'tenant-1',
      }),
    ).rejects.toThrow('Owner role cannot be revoked through an access review')

    expect(tx.delete).not.toHaveBeenCalled()
    expect(tx.update).not.toHaveBeenCalled()
    expect(writeAuditEvent).not.toHaveBeenCalled()
  })

  it('updates membership role when decision is change_role', async () => {
    const reviewQuery = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([{ id: 'review-1', status: 'open' }]),
    }
    const itemQuery = {
      from: vi.fn().mockReturnThis(),
      leftJoin: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([
        {
          id: 'item-1',
          membershipId: 'mbr-9',
          membershipTenantId: 'tenant-1',
          membershipRole: 'location_staff',
        },
      ]),
    }
    const lockedReviewQuery = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      for: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([{ id: 'review-1', status: 'open' }]),
    }
    const lockedMembershipQuery = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      for: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([{ id: 'mbr-9', role: 'location_staff' }]),
    }
    const txUpdateChain = {
      set: vi.fn().mockReturnThis(),
      where: vi.fn().mockResolvedValue([{ id: 'mbr-9' }]),
    }
    let txSelectCallCount = 0
    const tx = {
      select: vi.fn().mockImplementation(() => {
        txSelectCallCount += 1
        return txSelectCallCount === 1 ? lockedReviewQuery : lockedMembershipQuery
      }),
      update: vi.fn().mockReturnValue(txUpdateChain),
    }
    let selectCallCount = 0
    const mockDb = {
      select: vi.fn().mockImplementation(() => {
        selectCallCount += 1
        return selectCallCount === 1 ? reviewQuery : itemQuery
      }),
      transaction: vi
        .fn()
        .mockImplementation(async (fn: (t: typeof tx) => Promise<void>) => fn(tx)),
    }

    await recordDecision(mockDb as unknown as AccessReviewDb, {
      reviewId: 'review-1',
      itemId: 'item-1',
      decision: 'change_role',
      targetRole: 'auditor',
      notes: 'Change to read-only SOC 2 role',
      actorId: 'user-1',
      tenantId: 'tenant-1',
    })

    expect(mockDb.transaction).toHaveBeenCalledTimes(1)
    expect(tx.update).toHaveBeenCalledTimes(2)
    expect(txUpdateChain.set).toHaveBeenCalledWith({ role: 'auditor' })
    expect(writeAuditEvent).toHaveBeenCalledWith(
      tx,
      expect.objectContaining({
        action: 'membership.role_changed',
        resourceId: 'mbr-9',
        before: { role: 'location_staff' },
        after: { role: 'auditor', changedViaAccessReview: 'review-1' },
      }),
    )
  })

  it('pre-provisions an active location grant when access review changes to a location-scoped role', async () => {
    const reviewQuery = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([{ id: 'review-1', status: 'open' }]),
    }
    const itemQuery = {
      from: vi.fn().mockReturnThis(),
      leftJoin: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([
        {
          id: 'item-1',
          membershipId: 'mbr-9',
          membershipTenantId: 'tenant-1',
          membershipRole: 'auditor',
        },
      ]),
    }
    const lockedReviewQuery = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      for: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([{ id: 'review-1', status: 'open' }]),
    }
    const lockedItemQuery = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      for: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([{ id: 'item-1', decision: null }]),
    }
    const lockedMembershipQuery = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      for: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([{ id: 'mbr-9', role: 'auditor' }]),
    }
    const existingGrantQuery = {
      from: vi.fn().mockReturnThis(),
      innerJoin: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([]),
    }
    const defaultLocationQuery = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([{ id: 'loc-primary' }]),
    }
    const txUpdateChain = {
      set: vi.fn().mockReturnThis(),
      where: vi.fn().mockResolvedValue([{ id: 'item-1' }]),
    }
    const txInsertChain = {
      values: vi.fn().mockReturnValue({
        onConflictDoNothing: vi.fn().mockResolvedValue(undefined),
      }),
    }
    const txQueries = [
      lockedReviewQuery,
      lockedItemQuery,
      lockedMembershipQuery,
      existingGrantQuery,
      defaultLocationQuery,
    ]
    const tx = {
      select: vi.fn().mockImplementation(() => txQueries.shift()),
      insert: vi.fn().mockReturnValue(txInsertChain),
      update: vi.fn().mockReturnValue(txUpdateChain),
    }
    let selectCallCount = 0
    const mockDb = {
      select: vi.fn().mockImplementation(() => {
        selectCallCount += 1
        return selectCallCount === 1 ? reviewQuery : itemQuery
      }),
      transaction: vi
        .fn()
        .mockImplementation(async (fn: (t: typeof tx) => Promise<void>) => fn(tx)),
    }

    await recordDecision(mockDb as unknown as AccessReviewDb, {
      reviewId: 'review-1',
      itemId: 'item-1',
      decision: 'change_role',
      targetRole: 'location_manager',
      notes: 'Restrict to a location-scoped manager role',
      actorId: 'user-1',
      tenantId: 'tenant-1',
    })

    expect(tx.insert).toHaveBeenCalledTimes(1)
    expect(txInsertChain.values).toHaveBeenCalledWith({
      tenantId: 'tenant-1',
      membershipId: 'mbr-9',
      locationId: 'loc-primary',
    })
    expect(txUpdateChain.set).toHaveBeenCalledWith({ role: 'location_manager' })
    expect(writeAuditEvent).toHaveBeenCalledWith(
      tx,
      expect.objectContaining({
        action: 'membership.role_changed',
        after: { role: 'location_manager', changedViaAccessReview: 'review-1' },
      }),
    )
  })

  it('rejects access review changes to location-scoped roles when no active location exists', async () => {
    const reviewQuery = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([{ id: 'review-1', status: 'open' }]),
    }
    const itemQuery = {
      from: vi.fn().mockReturnThis(),
      leftJoin: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([
        {
          id: 'item-1',
          membershipId: 'mbr-9',
          membershipTenantId: 'tenant-1',
          membershipRole: 'auditor',
        },
      ]),
    }
    const lockedReviewQuery = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      for: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([{ id: 'review-1', status: 'open' }]),
    }
    const lockedItemQuery = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      for: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([{ id: 'item-1', decision: null }]),
    }
    const lockedMembershipQuery = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      for: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([{ id: 'mbr-9', role: 'auditor' }]),
    }
    const existingGrantQuery = {
      from: vi.fn().mockReturnThis(),
      innerJoin: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([]),
    }
    const defaultLocationQuery = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([]),
    }
    const txUpdateChain = {
      set: vi.fn().mockReturnThis(),
      where: vi.fn().mockResolvedValue([{ id: 'mbr-9' }]),
    }
    const txQueries = [
      lockedReviewQuery,
      lockedItemQuery,
      lockedMembershipQuery,
      existingGrantQuery,
      defaultLocationQuery,
    ]
    const tx = {
      select: vi.fn().mockImplementation(() => txQueries.shift()),
      insert: vi.fn(),
      update: vi.fn().mockReturnValue(txUpdateChain),
    }
    let selectCallCount = 0
    const mockDb = {
      select: vi.fn().mockImplementation(() => {
        selectCallCount += 1
        return selectCallCount === 1 ? reviewQuery : itemQuery
      }),
      transaction: vi
        .fn()
        .mockImplementation(async (fn: (t: typeof tx) => Promise<void>) => fn(tx)),
    }

    await expect(
      recordDecision(mockDb as unknown as AccessReviewDb, {
        reviewId: 'review-1',
        itemId: 'item-1',
        decision: 'change_role',
        targetRole: 'location_staff',
        notes: 'Restrict to staff',
        actorId: 'user-1',
        tenantId: 'tenant-1',
      }),
    ).rejects.toThrow('Location-scoped access review role changes require an active location')

    expect(tx.insert).not.toHaveBeenCalled()
    expect(tx.update).not.toHaveBeenCalled()
    expect(writeAuditEvent).not.toHaveBeenCalled()
  })

  it('does not audit a role change when the membership disappears before transaction lock', async () => {
    const reviewQuery = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([{ id: 'review-1', status: 'open' }]),
    }
    const itemQuery = {
      from: vi.fn().mockReturnThis(),
      leftJoin: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([
        {
          id: 'item-1',
          membershipId: 'mbr-9',
          membershipTenantId: 'tenant-1',
          membershipRole: 'location_staff',
        },
      ]),
    }
    const lockedReviewQuery = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      for: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([{ id: 'review-1', status: 'open' }]),
    }
    const missingMembershipQuery = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      for: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([]),
    }
    const txUpdateChain = {
      set: vi.fn().mockReturnThis(),
      where: vi.fn().mockResolvedValue([{ id: 'mbr-9' }]),
    }
    let txSelectCallCount = 0
    const tx = {
      select: vi.fn().mockImplementation(() => {
        txSelectCallCount += 1
        return txSelectCallCount === 1 ? lockedReviewQuery : missingMembershipQuery
      }),
      update: vi.fn().mockReturnValue(txUpdateChain),
    }
    let selectCallCount = 0
    const mockDb = {
      select: vi.fn().mockImplementation(() => {
        selectCallCount += 1
        return selectCallCount === 1 ? reviewQuery : itemQuery
      }),
      transaction: vi
        .fn()
        .mockImplementation(async (fn: (t: typeof tx) => Promise<void>) => fn(tx)),
    }

    await expect(
      recordDecision(mockDb as unknown as AccessReviewDb, {
        reviewId: 'review-1',
        itemId: 'item-1',
        decision: 'change_role',
        targetRole: 'auditor',
        notes: 'Change to read-only SOC 2 role',
        actorId: 'user-1',
        tenantId: 'tenant-1',
      }),
    ).rejects.toThrow('Access review item not found')

    expect(tx.update).not.toHaveBeenCalled()
    expect(writeAuditEvent).not.toHaveBeenCalled()
  })

  it('requires a target role when decision is change_role', async () => {
    const reviewQuery = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([{ id: 'review-1', status: 'open' }]),
    }
    const itemQuery = {
      from: vi.fn().mockReturnThis(),
      leftJoin: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([
        {
          id: 'item-1',
          membershipId: 'mbr-9',
          membershipTenantId: 'tenant-1',
          membershipRole: 'location_staff',
        },
      ]),
    }
    let selectCallCount = 0
    const mockDb = {
      select: vi.fn().mockImplementation(() => {
        selectCallCount += 1
        return selectCallCount === 1 ? reviewQuery : itemQuery
      }),
      transaction: vi.fn(),
    }

    await expect(
      recordDecision(mockDb as unknown as AccessReviewDb, {
        reviewId: 'review-1',
        itemId: 'item-1',
        decision: 'change_role',
        notes: '',
        actorId: 'user-1',
        tenantId: 'tenant-1',
      }),
    ).rejects.toThrow('Target role is required')

    expect(mockDb.transaction).not.toHaveBeenCalled()
    expect(writeAuditEvent).not.toHaveBeenCalled()
  })

  it('requires reviewer notes for revoke and role-change decisions', async () => {
    const mockDb = { select: vi.fn(), transaction: vi.fn() }

    await expect(
      recordDecision(mockDb as unknown as AccessReviewDb, {
        reviewId: 'review-1',
        itemId: 'item-1',
        decision: 'revoke',
        notes: ' ',
        actorId: 'user-1',
        tenantId: 'tenant-1',
      }),
    ).rejects.toThrow('Reviewer notes are required')

    expect(mockDb.select).not.toHaveBeenCalled()
    expect(mockDb.transaction).not.toHaveBeenCalled()
  })

  it('rolls back membership delete when audit write fails during revoke', async () => {
    const reviewQuery = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([{ id: 'review-1', status: 'open' }]),
    }
    const itemQuery = {
      from: vi.fn().mockReturnThis(),
      leftJoin: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([
        {
          id: 'item-1',
          membershipId: 'mbr-5',
          membershipTenantId: 'tenant-1',
        },
      ]),
    }
    const lockedReviewQuery = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      for: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([{ id: 'review-1', status: 'open' }]),
    }
    const txDeleteChain = { where: vi.fn().mockResolvedValue(undefined) }
    const txUpdateChain = {
      set: vi.fn().mockReturnThis(),
      where: vi.fn().mockResolvedValue([{ id: 'item-1' }]),
    }
    const tx = {
      select: vi.fn().mockReturnValue(lockedReviewQuery),
      delete: vi.fn().mockReturnValue(txDeleteChain),
      update: vi.fn().mockReturnValue(txUpdateChain),
    }
    let selectCallCount = 0
    const mockDb = {
      select: vi.fn().mockImplementation(() => {
        selectCallCount += 1
        return selectCallCount === 1 ? reviewQuery : itemQuery
      }),
      transaction: vi.fn().mockImplementation(async (fn: (t: typeof tx) => Promise<void>) => {
        // Simulate transaction: run fn but if it throws, the transaction is rolled back
        return fn(tx)
      }),
    }
    vi.mocked(writeAuditEvent).mockRejectedValueOnce(new Error('audit write failed'))

    await expect(
      recordDecision(mockDb as unknown as AccessReviewDb, {
        reviewId: 'review-1',
        itemId: 'item-1',
        decision: 'revoke',
        notes: 'Access should be removed',
        actorId: 'user-1',
        tenantId: 'tenant-1',
      }),
    ).rejects.toThrow('audit write failed')
    // The transaction wrapper propagated the error - in a real DB this means rollback
    expect(mockDb.transaction).toHaveBeenCalled()
  })
})

describeWithTestDB('recordDecision integration', () => {
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

  async function seedTenant(role: 'org_admin' | 'auditor' = 'auditor') {
    const db = requireTestDB().db
    const [org] = await db
      .insert(organizations)
      .values(makeOrganization({ plan: 'group', planStatus: 'active' }))
      .returning()
    const [user] = await db.insert(users).values(makeUser()).returning()
    const [membership] = await db
      .insert(memberships)
      .values(makeMembership({ userId: user.id, tenantId: org.id, role }))
      .returning()

    return { org, user, membership }
  }

  it('rejects opening access reviews when the actor is not a tenant member', async () => {
    const db = requireTestDB().db
    const tenantA = await seedTenant()
    const tenantB = await seedTenant()

    await expect(
      openAccessReview(db, {
        tenantId: tenantA.org.id,
        actorId: tenantB.user.id,
        periodStart: new Date('2026-01-01T00:00:00.000Z'),
        periodEnd: new Date('2026-03-31T00:00:00.000Z'),
      }),
    ).rejects.toThrow('Access review actor is not a member of this organization')

    const rows = await db
      .select()
      .from(accessReviews)
      .where(eq(accessReviews.tenantId, tenantA.org.id))
    expect(rows).toEqual([])
    expect(writeAuditEvent).not.toHaveBeenCalled()
  }, 120_000)

  it('rejects review decisions when the actor is not a tenant member', async () => {
    const db = requireTestDB().db
    const tenantA = await seedTenant()
    const tenantB = await seedTenant()
    const [review] = await db
      .insert(accessReviews)
      .values({
        tenantId: tenantA.org.id,
        periodStart: new Date('2026-01-01T00:00:00.000Z'),
        periodEnd: new Date('2026-03-31T00:00:00.000Z'),
        status: 'open',
      })
      .returning()
    const [item] = await db
      .insert(accessReviewItems)
      .values({ reviewId: review.id, membershipId: tenantA.membership.id })
      .returning()

    await expect(
      recordDecision(db, {
        reviewId: review.id,
        itemId: item.id,
        decision: 'keep',
        notes: '',
        actorId: tenantB.user.id,
        tenantId: tenantA.org.id,
      }),
    ).rejects.toThrow('Access review actor is not a member of this organization')

    const [currentItem] = await db
      .select()
      .from(accessReviewItems)
      .where(eq(accessReviewItems.id, item.id))
      .limit(1)
    expect(currentItem?.decision).toBeNull()
    expect(writeAuditEvent).not.toHaveBeenCalled()
  }, 120_000)

  it('rejects keep decisions for access review items whose membership is outside the tenant', async () => {
    const db = requireTestDB().db
    const tenantA = await seedTenant()
    const tenantB = await seedTenant()
    const [review] = await db
      .insert(accessReviews)
      .values({
        tenantId: tenantA.org.id,
        periodStart: new Date('2026-01-01T00:00:00.000Z'),
        periodEnd: new Date('2026-03-31T00:00:00.000Z'),
        status: 'open',
      })
      .returning()
    const [item] = await db
      .insert(accessReviewItems)
      .values({ reviewId: review.id, membershipId: tenantB.membership.id })
      .returning()

    await expect(
      recordDecision(db, {
        reviewId: review.id,
        itemId: item.id,
        decision: 'keep',
        notes: '',
        actorId: tenantA.user.id,
        tenantId: tenantA.org.id,
      }),
    ).rejects.toThrow('Access review item not found')

    const [currentItem] = await db
      .select()
      .from(accessReviewItems)
      .where(eq(accessReviewItems.id, item.id))
      .limit(1)
    expect(currentItem?.decision).toBeNull()
    expect(writeAuditEvent).not.toHaveBeenCalled()
  }, 120_000)

  it('rejects closing access reviews when the actor is not a tenant member', async () => {
    const db = requireTestDB().db
    const tenantA = await seedTenant()
    const tenantB = await seedTenant()
    const [review] = await db
      .insert(accessReviews)
      .values({
        tenantId: tenantA.org.id,
        periodStart: new Date('2026-01-01T00:00:00.000Z'),
        periodEnd: new Date('2026-03-31T00:00:00.000Z'),
        status: 'open',
      })
      .returning()

    await expect(
      closeAccessReview(db, {
        reviewId: review.id,
        actorId: tenantB.user.id,
        tenantId: tenantA.org.id,
      }),
    ).rejects.toThrow('Access review actor is not a member of this organization')

    const [currentReview] = await db
      .select()
      .from(accessReviews)
      .where(eq(accessReviews.id, review.id))
      .limit(1)
    expect(currentReview?.status).toBe('open')
    expect(writeAuditEvent).not.toHaveBeenCalled()
  }, 120_000)

  it('provisions a tenant-owned location grant when existing grants point to another organization', async () => {
    const db = requireTestDB().db
    const [tenantOrg] = await db
      .insert(organizations)
      .values(makeOrganization({ plan: 'group', planStatus: 'active' }))
      .returning()
    const [otherOrg] = await db
      .insert(organizations)
      .values(makeOrganization({ plan: 'group', planStatus: 'active' }))
      .returning()
    const [user] = await db.insert(users).values(makeUser()).returning()
    const [membership] = await db
      .insert(memberships)
      .values(makeMembership({ userId: user.id, tenantId: tenantOrg.id, role: 'auditor' }))
      .returning()
    const [tenantLocation] = await db
      .insert(locations)
      .values({
        organizationId: tenantOrg.id,
        name: 'Tenant Primary',
        slug: 'tenant-primary',
        status: 'active',
        isPrimary: true,
      })
      .returning()
    const [otherLocation] = await db
      .insert(locations)
      .values({
        organizationId: otherOrg.id,
        name: 'Other Primary',
        slug: 'other-primary',
        status: 'active',
        isPrimary: true,
      })
      .returning()
    const [review] = await db
      .insert(accessReviews)
      .values({
        tenantId: tenantOrg.id,
        periodStart: new Date('2026-01-01T00:00:00.000Z'),
        periodEnd: new Date('2026-03-31T00:00:00.000Z'),
        status: 'open',
      })
      .returning()
    const [item] = await db
      .insert(accessReviewItems)
      .values({ reviewId: review.id, membershipId: membership.id })
      .returning()

    await db.insert(locationGrants).values({
      tenantId: tenantOrg.id,
      membershipId: membership.id,
      locationId: otherLocation.id,
    })

    await recordDecision(db, {
      reviewId: review.id,
      itemId: item.id,
      decision: 'change_role',
      targetRole: 'location_staff',
      notes: 'Restrict to a tenant-owned location',
      actorId: user.id,
      tenantId: tenantOrg.id,
    })

    const tenantOwnedGrants = await db
      .select({ locationId: locationGrants.locationId })
      .from(locationGrants)
      .innerJoin(locations, eq(locations.id, locationGrants.locationId))
      .where(
        and(
          eq(locationGrants.membershipId, membership.id),
          eq(locationGrants.tenantId, tenantOrg.id),
          eq(locations.organizationId, tenantOrg.id),
        ),
      )

    expect(tenantOwnedGrants).toEqual([{ locationId: tenantLocation.id }])
    expect(writeAuditEvent).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        action: 'membership.role_changed',
        resourceId: membership.id,
      }),
    )
  }, 120_000)
})

describe('closeAccessReview', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('rejects close when review not found for tenant', async () => {
    const membershipQuery = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([{ id: 'membership-1' }]),
    }
    const reviewQuery = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      for: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([]),
    }
    const tx = {
      select: vi.fn().mockReturnValueOnce(membershipQuery).mockReturnValue(reviewQuery),
      update: vi.fn(),
    }
    const mockDb = {
      transaction: vi
        .fn()
        .mockImplementation(async (fn: (currentTx: typeof tx) => Promise<void>) => fn(tx)),
    }

    await expect(
      closeAccessReview(mockDb as unknown as AccessReviewDb, {
        reviewId: 'review-other',
        actorId: 'user-1',
        tenantId: 'tenant-1',
      }),
    ).rejects.toThrow('Access review not found')
  })

  it('rejects close when review is already closed', async () => {
    const membershipQuery = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([{ id: 'membership-1' }]),
    }
    const reviewQuery = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      for: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([{ id: 'review-1', status: 'closed' }]),
    }
    const tx = {
      select: vi.fn().mockReturnValueOnce(membershipQuery).mockReturnValue(reviewQuery),
      update: vi.fn(),
    }
    const mockDb = {
      transaction: vi
        .fn()
        .mockImplementation(async (fn: (currentTx: typeof tx) => Promise<void>) => fn(tx)),
    }

    await expect(
      closeAccessReview(mockDb as unknown as AccessReviewDb, {
        reviewId: 'review-1',
        actorId: 'user-1',
        tenantId: 'tenant-1',
      }),
    ).rejects.toThrow('Access review is already closed')
  })

  it('rejects close when undecided items exist', async () => {
    const membershipQuery = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([{ id: 'membership-1' }]),
    }
    const reviewQuery = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      for: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([{ id: 'review-1', status: 'open' }]),
    }
    const undecidedQuery = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      for: vi.fn().mockResolvedValue([{ id: 'item-1', decision: null }]),
    }
    const tx = {
      select: vi.fn().mockImplementation(() => {
        const next = tx.select.mock.calls.length
        if (next === 1) return membershipQuery
        return next === 2 ? reviewQuery : undecidedQuery
      }),
      update: vi.fn(),
    }
    const mockDb = {
      transaction: vi
        .fn()
        .mockImplementation(async (fn: (currentTx: typeof tx) => Promise<void>) => fn(tx)),
    }

    await expect(
      closeAccessReview(mockDb as unknown as AccessReviewDb, {
        reviewId: 'review-1',
        actorId: 'user-1',
        tenantId: 'tenant-1',
      }),
    ).rejects.toThrow(/undecided/)
  })

  it('closes review when all items have decisions and writes audit event', async () => {
    const membershipQuery = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([{ id: 'membership-1' }]),
    }
    const reviewQuery = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      for: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([{ id: 'review-1', status: 'open' }]),
    }
    const undecidedQuery = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      for: vi.fn().mockResolvedValue([]),
    }
    const updateChain = {
      set: vi.fn().mockReturnThis(),
      where: vi.fn().mockResolvedValue([{ id: 'review-1', status: 'closed' }]),
    }
    const tx = {
      select: vi.fn().mockImplementation(() => {
        const next = tx.select.mock.calls.length
        if (next === 1) return membershipQuery
        return next === 2 ? reviewQuery : undecidedQuery
      }),
      update: vi.fn().mockReturnValue(updateChain),
    }
    const mockDb = {
      transaction: vi
        .fn()
        .mockImplementation(async (fn: (currentTx: typeof tx) => Promise<void>) => fn(tx)),
    }

    await closeAccessReview(mockDb as unknown as AccessReviewDb, {
      reviewId: 'review-1',
      actorId: 'user-1',
      tenantId: 'tenant-1',
    })

    expect(mockDb.transaction).toHaveBeenCalled()
    expect(tx.update).toHaveBeenCalled()
    expect(writeAuditEvent).toHaveBeenCalledWith(
      tx,
      expect.objectContaining({
        action: 'access_review.closed',
        resourceId: 'review-1',
      }),
    )
  })
})
