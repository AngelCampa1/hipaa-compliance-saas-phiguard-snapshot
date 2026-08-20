import { describe, expect, it, vi } from 'vitest'
import type { DB } from '@phiguard/db/server'
import {
  assertEvidenceFileScanClean,
  recordEvidenceFileScanPending,
  updateEvidenceFileScanResult,
} from './evidence-file-scan.js'

function makeInsertDb() {
  const onConflictDoUpdate = vi.fn().mockResolvedValue(undefined)
  const values = vi.fn().mockReturnValue({ onConflictDoUpdate })
  const insert = vi.fn().mockReturnValue({ values })

  return {
    db: { insert } as unknown as DB,
    insert,
    values,
    onConflictDoUpdate,
  }
}

function makeUpdateDb(result: unknown[] = []) {
  const selectLimit = vi.fn().mockResolvedValue([])
  const selectWhere = vi.fn().mockReturnValue({ limit: selectLimit })
  const from = vi.fn().mockReturnValue({ where: selectWhere })
  const select = vi.fn().mockReturnValue({ from })
  const returning = vi.fn().mockResolvedValue(result)
  const where = vi.fn().mockReturnValue({ returning })
  const set = vi.fn().mockReturnValue({ where })
  const update = vi.fn().mockReturnValue({ set })

  return {
    db: { select, update } as unknown as DB,
    selectLimit,
    set,
    where,
    returning,
  }
}

function makeUpdateThenSelectDb(updateResult: unknown[] = [], selectResult: unknown[] = []) {
  const db = makeUpdateDb(updateResult)
  db.selectLimit.mockResolvedValue(selectResult)
  return db
}

function makeSelectDb(result: unknown[] = []) {
  const limit = vi.fn().mockResolvedValue(result)
  const where = vi.fn().mockReturnValue({ limit })
  const from = vi.fn().mockReturnValue({ where })
  const select = vi.fn().mockReturnValue({ from })

  return {
    db: { select } as unknown as DB,
    select,
    where,
    limit,
  }
}

describe('recordEvidenceFileScanPending', () => {
  it('upserts pending scan state for evidence files', async () => {
    const { db, values, onConflictDoUpdate } = makeInsertDb()

    await recordEvidenceFileScanPending(db, {
      tenantId: 'org-1',
      s3Key: 'evidence/org-1/soc2/access-review.pdf',
      uploadedBy: 'user-1',
    })

    expect(values).toHaveBeenCalledWith(
      expect.objectContaining({
        tenantId: 'org-1',
        s3Key: 'evidence/org-1/soc2/access-review.pdf',
        uploadedBy: 'user-1',
        avStatus: 'pending',
      }),
    )
    expect(onConflictDoUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        set: expect.objectContaining({
          avStatus: 'pending',
          uploadedBy: 'user-1',
          scannedAt: null,
        }),
      }),
    )
  })

  it('marks mock-upload evidence scans as skipped and scanned', async () => {
    const { db, values, onConflictDoUpdate } = makeInsertDb()

    await recordEvidenceFileScanPending(db, {
      tenantId: 'org-1',
      s3Key: 'evidence/org-1/soc2/access-review.pdf',
      uploadedBy: 'user-1',
      avStatus: 'skipped',
    })

    expect(values).toHaveBeenCalledWith(
      expect.objectContaining({
        avStatus: 'skipped',
        scannedAt: expect.any(Date),
      }),
    )
    expect(onConflictDoUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        set: expect.objectContaining({
          avStatus: 'skipped',
          scannedAt: expect.any(Date),
        }),
      }),
    )
  })
})

describe('updateEvidenceFileScanResult', () => {
  it('returns the updated scan for a pending clean callback', async () => {
    const scan = { id: 'scan-1', avStatus: 'clean' }
    const { db, set } = makeUpdateDb([scan])

    await expect(
      updateEvidenceFileScanResult(db, {
        tenantId: 'org-1',
        s3Key: 'evidence/org-1/soc2/access-review.pdf',
        avStatus: 'clean',
      }),
    ).resolves.toBe(scan)

    expect(set).toHaveBeenCalledWith(
      expect.objectContaining({
        avStatus: 'clean',
        scannedAt: expect.any(Date),
      }),
    )
  })

  it('returns null for stale or non-pending callbacks', async () => {
    const { db } = makeUpdateDb([])

    await expect(
      updateEvidenceFileScanResult(db, {
        tenantId: 'org-1',
        s3Key: 'evidence/org-1/soc2/access-review.pdf',
        avStatus: 'infected',
      }),
    ).resolves.toBeNull()
  })

  it('returns the existing scan for duplicate terminal callbacks', async () => {
    const scan = { id: 'scan-1', avStatus: 'clean' }
    const { db } = makeUpdateThenSelectDb([], [scan])

    await expect(
      updateEvidenceFileScanResult(db, {
        tenantId: 'org-1',
        s3Key: 'evidence/org-1/soc2/access-review.pdf',
        avStatus: 'clean',
      }),
    ).resolves.toBe(scan)
  })
})

describe('assertEvidenceFileScanClean', () => {
  it.each(['clean', 'skipped'] as const)('allows %s evidence downloads', async (avStatus) => {
    const { db } = makeSelectDb([{ avStatus }])

    await expect(
      assertEvidenceFileScanClean(db, {
        tenantId: 'org-1',
        s3Key: 'evidence/org-1/soc2/access-review.pdf',
      }),
    ).resolves.toBeUndefined()
  })

  it('blocks infected evidence downloads', async () => {
    const { db } = makeSelectDb([{ avStatus: 'infected' }])

    await expect(
      assertEvidenceFileScanClean(db, {
        tenantId: 'org-1',
        s3Key: 'evidence/org-1/soc2/access-review.pdf',
      }),
    ).rejects.toThrow('Evidence file failed malware scanning')
  })

  it.each([[[{ avStatus: 'pending' }]], [[]]] as const)(
    'blocks evidence downloads before scan completion',
    async (result) => {
      const { db } = makeSelectDb([...result])

      await expect(
        assertEvidenceFileScanClean(db, {
          tenantId: 'org-1',
          s3Key: 'evidence/org-1/soc2/access-review.pdf',
        }),
      ).rejects.toThrow('Evidence file scan is not complete')
    },
  )
})
