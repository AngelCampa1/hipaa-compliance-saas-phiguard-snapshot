import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createTestDB,
  hasContainerRuntime,
  makeMembership,
  makeOrganization,
  makeUser,
  type TestDB,
} from '@phiguard/db/testing'
import { memberships, organizations, trainingCourses, trainingRecords, users } from '@phiguard/db'
import { eq } from 'drizzle-orm'
import {
  assignCourse,
  computeDueStatus,
  createTrainingCourse,
  deactivateTrainingCourse,
  markCompleted,
  reactivateTrainingCourse,
  reassignTraining,
  reopenTrainingCompletion,
  unassignTraining,
  updateTrainingDueDate,
} from '../../program/training.js'
import { writeAuditEvent } from '@phiguard/audit'

type AssignCourseDb = Parameters<typeof assignCourse>[0]
type MarkCompletedDb = Parameters<typeof markCompleted>[0]
type CreateTrainingCourseDb = Parameters<typeof createTrainingCourse>[0]
type DeactivateTrainingCourseDb = Parameters<typeof deactivateTrainingCourse>[0]
type ReactivateTrainingCourseDb = Parameters<typeof reactivateTrainingCourse>[0]
type TrainingRecordMutationDb = Parameters<typeof unassignTraining>[0]

const describeWithTestDB = hasContainerRuntime() ? describe : describe.skip

vi.mock('@phiguard/audit', () => ({
  writeAuditEvent: vi.fn().mockResolvedValue(undefined),
  withAuditContext: vi.fn(),
  getAuditContext: vi.fn().mockReturnValue({ actorId: 'actor-123' }),
  logger: { error: vi.fn(), info: vi.fn(), safe: vi.fn() },
}))

describeWithTestDB('training integration actor and user isolation', () => {
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

  async function seedCourse() {
    const { db } = requireTestDB()
    const tenant = await seedTenant()
    const [course] = await db
      .insert(trainingCourses)
      .values({
        tenantId: tenant.org.id,
        title: 'HIPAA Basics',
        frequencyDays: 365,
        isActive: true,
      })
      .returning()

    return { ...tenant, course }
  }

  async function seedTrainingRecord(input?: { completed?: boolean }) {
    const { db } = requireTestDB()
    const seeded = await seedCourse()
    const [record] = await db
      .insert(trainingRecords)
      .values({
        userId: seeded.user.id,
        courseId: seeded.course.id,
        status: input?.completed ? 'completed' : 'not_started',
        dueAt: new Date('2027-01-01T00:00:00.000Z'),
        completedAt: input?.completed ? new Date('2026-01-01T00:00:00.000Z') : null,
      })
      .returning()

    return { ...seeded, record }
  }

  it('rejects training course creation when the actor is not a tenant member', async () => {
    const { db } = requireTestDB()
    const tenantA = await seedTenant()
    const tenantB = await seedTenant()

    await expect(
      createTrainingCourse(db, {
        tenantId: tenantA.org.id,
        actorId: tenantB.user.id,
        title: 'Cross-tenant training',
        frequencyDays: 365,
      }),
    ).rejects.toThrow('Training actor is not a member of this organization')

    const rows = await db
      .select()
      .from(trainingCourses)
      .where(eq(trainingCourses.title, 'Cross-tenant training'))
    expect(rows).toEqual([])
  })

  it('rejects assignment when the assigning actor is not a tenant member', async () => {
    const { db } = requireTestDB()
    const tenantA = await seedCourse()
    const tenantB = await seedTenant()

    await expect(
      assignCourse(db, {
        tenantId: tenantA.org.id,
        actorId: tenantB.user.id,
        userId: tenantA.user.id,
        courseId: tenantA.course.id,
        dueAt: new Date('2027-01-01T00:00:00.000Z'),
      }),
    ).rejects.toThrow('Training actor is not a member of this organization')

    const rows = await db
      .select()
      .from(trainingRecords)
      .where(eq(trainingRecords.courseId, tenantA.course.id))
    expect(rows).toEqual([])
  })

  it('rejects managed completion when the actor is not a tenant member', async () => {
    const { db } = requireTestDB()
    const tenantA = await seedTrainingRecord()
    const tenantB = await seedTenant()

    await expect(
      markCompleted(db, {
        recordId: tenantA.record.id,
        tenantId: tenantA.org.id,
        actorId: tenantB.user.id,
        actorUserId: tenantB.user.id,
        actorCanManageAllUsers: true,
      }),
    ).rejects.toThrow('Training actor is not a member of this organization')

    const [current] = await db
      .select()
      .from(trainingRecords)
      .where(eq(trainingRecords.id, tenantA.record.id))
      .limit(1)
    expect(current?.status).toBe('not_started')
  })

  it('rejects due-date updates when the actor is not a tenant member', async () => {
    const { db } = requireTestDB()
    const tenantA = await seedTrainingRecord()
    const tenantB = await seedTenant()

    await expect(
      updateTrainingDueDate(db, {
        recordId: tenantA.record.id,
        tenantId: tenantA.org.id,
        actorId: tenantB.user.id,
        dueAt: new Date('2028-01-01T00:00:00.000Z'),
      }),
    ).rejects.toThrow('Training actor is not a member of this organization')

    const [current] = await db
      .select()
      .from(trainingRecords)
      .where(eq(trainingRecords.id, tenantA.record.id))
      .limit(1)
    expect(current?.dueAt).toEqual(new Date('2027-01-01T00:00:00.000Z'))
  })
})

describe('computeDueStatus', () => {
  const now = new Date('2026-04-16T12:00:00Z')

  it('returns overdue when not completed and past due', () => {
    expect(computeDueStatus({ status: 'not_started', dueAt: new Date('2026-04-01') }, now)).toBe(
      'overdue',
    )
  })

  it('returns due_soon when due within 7 days', () => {
    expect(computeDueStatus({ status: 'not_started', dueAt: new Date('2026-04-20') }, now)).toBe(
      'due_soon',
    )
  })

  it('returns not_started when due more than 7 days away and status is not_started', () => {
    expect(computeDueStatus({ status: 'not_started', dueAt: new Date('2026-05-01') }, now)).toBe(
      'not_started',
    )
  })

  it('returns ok when completed even if past due', () => {
    expect(computeDueStatus({ status: 'completed', dueAt: new Date('2026-04-01') }, now)).toBe('ok')
  })

  it('returns ok for in_progress records that are not past due', () => {
    expect(computeDueStatus({ status: 'in_progress', dueAt: new Date('2026-05-30') }, now)).toBe(
      'ok',
    )
  })
})

describe('assignCourse', () => {
  function makeAssignCourseDb(opts: {
    courseExists: boolean
    actorMembershipExists?: boolean
    membershipExists: boolean
    insertSkipped?: boolean
    existingRecord?: { id: string; userId: string; courseId: string; status: string }
  }) {
    let selectCallCount = 0
    const insertedRecord = { id: 'TR1', userId: 'U1', courseId: 'C1', status: 'not_started' }
    const returning = vi.fn().mockResolvedValue(opts.insertSkipped ? [] : [insertedRecord])
    const onConflictDoNothing = vi.fn().mockReturnValue({ returning })
    const insertValues = vi.fn().mockReturnValue({ onConflictDoNothing })

    const db = {
      insert: vi.fn().mockReturnValue({
        values: insertValues,
      }),
      select: vi.fn().mockImplementation(() => ({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockImplementation(() => {
          selectCallCount += 1

          if (selectCallCount === 1) {
            return Promise.resolve(opts.courseExists ? [{ id: 'C1' }] : [])
          }

          if (selectCallCount === 2) {
            return Promise.resolve(
              opts.actorMembershipExists === false ? [] : [{ id: 'ACTOR-MBR1' }],
            )
          }

          if (selectCallCount === 3) {
            return Promise.resolve(opts.membershipExists ? [{ id: 'MBR1' }] : [])
          }

          if (selectCallCount === 4) {
            return Promise.resolve(opts.existingRecord ? [opts.existingRecord] : [])
          }

          return Promise.resolve([])
        }),
      })),
      transaction: vi.fn(),
      insertValues,
    }
    db.transaction.mockImplementation((fn: (tx: typeof db) => Promise<unknown>) => fn(db))

    return db
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('inserts a training_records row when the course and member belong to the tenant', async () => {
    const dueAt = new Date('2026-12-31')
    const db = makeAssignCourseDb({
      courseExists: true,
      membershipExists: true,
    }) as unknown as AssignCourseDb

    const result = await assignCourse(db, {
      tenantId: 'T1',
      actorId: 'admin-1',
      userId: 'U1',
      courseId: 'C1',
      dueAt,
    })

    expect(result).toBeDefined()
    expect(writeAuditEvent).toHaveBeenCalledWith(
      db,
      expect.objectContaining({
        action: 'training.assigned',
        resourceType: 'training_record',
        resourceId: 'TR1',
        after: expect.objectContaining({
          userId: 'U1',
          courseId: 'C1',
          dueAt,
        }),
      }),
    )
  })

  it('uses conflict-safe insert to avoid duplicating an assignment', async () => {
    const db = makeAssignCourseDb({
      courseExists: true,
      membershipExists: true,
    }) as unknown as AssignCourseDb

    await assignCourse(db, {
      tenantId: 'T1',
      actorId: 'admin-1',
      userId: 'U1',
      courseId: 'C1',
      dueAt: new Date('2026-12-31'),
    })

    const insertValues = vi.mocked(db.insert).mock.results[0]?.value.values
    const onConflictDoNothing = insertValues.mock.results[0]?.value.onConflictDoNothing
    expect(onConflictDoNothing).toHaveBeenCalledWith(
      expect.objectContaining({ target: expect.any(Array) }),
    )
  })

  it('returns the existing training record when a concurrent assignment already inserted it', async () => {
    const existingRecord = {
      id: 'TR-existing',
      userId: 'U1',
      courseId: 'C1',
      status: 'not_started',
    }
    const db = makeAssignCourseDb({
      courseExists: true,
      membershipExists: true,
      insertSkipped: true,
      existingRecord,
    }) as unknown as AssignCourseDb

    const result = await assignCourse(db, {
      tenantId: 'T1',
      actorId: 'admin-1',
      userId: 'U1',
      courseId: 'C1',
      dueAt: new Date('2026-12-31'),
    })

    expect(result).toBe(existingRecord)
    expect(db.insert).toHaveBeenCalled()
  })

  it('throws when the course does not belong to the tenant', async () => {
    const db = makeAssignCourseDb({
      courseExists: false,
      membershipExists: true,
    }) as unknown as AssignCourseDb

    await expect(
      assignCourse(db, {
        tenantId: 'T1',
        actorId: 'admin-1',
        userId: 'U1',
        courseId: 'C1',
        dueAt: new Date('2026-12-31'),
      }),
    ).rejects.toThrow('Training course not found')

    expect(db.insert).not.toHaveBeenCalled()
  })

  it('throws when the assignee is not a member of the tenant', async () => {
    const db = makeAssignCourseDb({
      courseExists: true,
      membershipExists: false,
    }) as unknown as AssignCourseDb

    await expect(
      assignCourse(db, {
        tenantId: 'T1',
        actorId: 'admin-1',
        userId: 'U1',
        courseId: 'C1',
        dueAt: new Date('2026-12-31'),
      }),
    ).rejects.toThrow('User not found in organization')

    expect(db.insert).not.toHaveBeenCalled()
  })
})

describe('training course management', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('creates an active tenant training course without writing course text to audit metadata', async () => {
    const course = {
      id: 'course-1',
      tenantId: 'T1',
      title: 'HIPAA Basics for Jane Patient',
      description: 'Annual HIPAA training mentions Jane Patient',
      frequencyDays: 365,
      isActive: true,
    }
    const values = vi.fn().mockReturnValue({
      returning: vi.fn().mockResolvedValue([course]),
    })
    const db = {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([{ id: 'membership-1' }]),
      }),
      insert: vi.fn().mockReturnValue({ values }),
      transaction: vi.fn(),
    }
    db.transaction.mockImplementation((fn: (tx: typeof db) => Promise<unknown>) => fn(db))

    const result = await createTrainingCourse(db as unknown as CreateTrainingCourseDb, {
      tenantId: 'T1',
      actorId: 'U1',
      title: 'HIPAA Basics for Jane Patient',
      description: 'Annual HIPAA training mentions Jane Patient',
      frequencyDays: 365,
    })

    expect(result).toBe(course)
    expect(values).toHaveBeenCalledWith({
      tenantId: 'T1',
      title: 'HIPAA Basics for Jane Patient',
      description: 'Annual HIPAA training mentions Jane Patient',
      frequencyDays: 365,
      isActive: true,
    })
    expect(writeAuditEvent).toHaveBeenCalledWith(
      db,
      expect.objectContaining({
        action: 'training_course.created',
        resourceType: 'training_course',
        resourceId: 'course-1',
        after: { frequencyDays: 365, isActive: true },
      }),
    )
    expect(JSON.stringify(vi.mocked(writeAuditEvent).mock.calls)).not.toContain('Jane Patient')
  })

  function makeCourseStatusDb(
    courseExists: boolean,
    updateReturns = true,
    overrides: { isActive?: boolean } = {},
  ) {
    const course = {
      id: 'course-1',
      tenantId: 'T1',
      title: 'HIPAA Basics',
      description: null,
      frequencyDays: 365,
      isActive: overrides.isActive ?? true,
    }
    const updateSet = vi.fn().mockReturnValue({
      where: vi.fn().mockReturnValue({
        returning: vi
          .fn()
          .mockResolvedValue(updateReturns ? [{ ...course, isActive: !course.isActive }] : []),
      }),
    })
    const db = {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue(courseExists ? [course] : []),
      }),
      update: vi.fn().mockReturnValue({ set: updateSet }),
      insert: vi.fn().mockReturnValue({ values: vi.fn().mockResolvedValue(undefined) }),
      transaction: vi.fn(),
      updateSet,
    }
    db.transaction.mockImplementation((fn: (tx: typeof db) => Promise<unknown>) => fn(db))
    return db
  }

  it('deactivates a tenant course without deleting existing assignments', async () => {
    const db = makeCourseStatusDb(true)

    await deactivateTrainingCourse(db as unknown as DeactivateTrainingCourseDb, {
      tenantId: 'T1',
      actorId: 'U1',
      courseId: 'course-1',
    })

    expect(db.updateSet).toHaveBeenCalledWith({ isActive: false })
    expect(writeAuditEvent).toHaveBeenCalledWith(
      db,
      expect.objectContaining({
        action: 'training_course.deactivated',
        resourceType: 'training_course',
        resourceId: 'course-1',
        before: { frequencyDays: 365, isActive: true },
        after: { isActive: false },
      }),
    )
    expect(JSON.stringify(vi.mocked(writeAuditEvent).mock.calls)).not.toContain('HIPAA Basics')
  })

  it('does not audit stale course deactivations when the update matches no rows', async () => {
    const db = makeCourseStatusDb(true, false) as unknown as DeactivateTrainingCourseDb & {
      updateSet: ReturnType<typeof vi.fn>
    }

    await expect(
      deactivateTrainingCourse(db, {
        tenantId: 'T1',
        actorId: 'U1',
        courseId: 'course-1',
      }),
    ).rejects.toThrow('Training course changed before it could be deactivated')

    expect(db.updateSet).toHaveBeenCalledWith({ isActive: false })
    expect(writeAuditEvent).not.toHaveBeenCalled()
  })

  it('reactivates a tenant course and writes an audit event', async () => {
    const db = makeCourseStatusDb(true, true, { isActive: false }) as unknown as
      ReactivateTrainingCourseDb & { updateSet: ReturnType<typeof vi.fn> }

    await reactivateTrainingCourse(db, {
      tenantId: 'T1',
      actorId: 'U1',
      courseId: 'course-1',
    })

    expect(db.updateSet).toHaveBeenCalledWith({ isActive: true })
    expect(writeAuditEvent).toHaveBeenCalledWith(
      db,
      expect.objectContaining({
        action: 'training_course.reactivated',
        resourceType: 'training_course',
        resourceId: 'course-1',
        before: { isActive: false },
        after: { isActive: true },
      }),
    )
  })

  it('does not audit stale course reactivations when the update matches no rows', async () => {
    const db = makeCourseStatusDb(true, false, { isActive: false }) as unknown as
      ReactivateTrainingCourseDb & { updateSet: ReturnType<typeof vi.fn> }

    await expect(
      reactivateTrainingCourse(db, {
        tenantId: 'T1',
        actorId: 'U1',
        courseId: 'course-1',
      }),
    ).rejects.toThrow('Training course changed before it could be reactivated')

    expect(db.updateSet).toHaveBeenCalledWith({ isActive: true })
    expect(writeAuditEvent).not.toHaveBeenCalled()
  })

  it('throws when deactivating a course outside the tenant', async () => {
    const db = {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      }),
      update: vi.fn(),
      transaction: vi.fn(),
    }

    await expect(
      deactivateTrainingCourse(db as unknown as DeactivateTrainingCourseDb, {
        tenantId: 'T1',
        actorId: 'U1',
        courseId: 'course-other',
      }),
    ).rejects.toThrow('Training course not found')

    expect(db.update).not.toHaveBeenCalled()
  })
})

describe('markCompleted', () => {
  function makeMarkCompletedDb(opts: {
    recordExists: boolean
    courseExists: boolean
    membershipExists: boolean
    updateReturns?: boolean
  }) {
    const record = { id: 'TR1', userId: 'U1', courseId: 'C1', status: 'in_progress' }
    const updateChain = {
      set: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      returning: vi
        .fn()
        .mockResolvedValue(opts.updateReturns === false ? [] : [{ ...record, status: 'completed' }]),
    }

    let selectCallCount = 0
    const selectChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockImplementation(() => {
        selectCallCount += 1

        if (selectCallCount === 1) {
          return Promise.resolve(opts.recordExists ? [record] : [])
        }

        if (selectCallCount === 2) {
          return Promise.resolve(opts.courseExists ? [{ id: 'C1' }] : [])
        }

        return Promise.resolve(opts.membershipExists ? [{ id: 'MBR1' }] : [])
      }),
    }

    const db = {
      update: vi.fn().mockReturnValue(updateChain),
      insert: vi.fn().mockReturnValue({ values: vi.fn().mockResolvedValue(undefined) }),
      select: vi.fn().mockReturnValue(selectChain),
      transaction: vi.fn(),
      updateSet: updateChain.set,
    }
    db.transaction.mockImplementation((fn: (tx: typeof db) => Promise<unknown>) => fn(db))
    return db
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('sets status to completed and writes audit event', async () => {
    const db = makeMarkCompletedDb({
      recordExists: true,
      courseExists: true,
      membershipExists: true,
    }) as unknown as MarkCompletedDb

    const result = await markCompleted(db, {
      recordId: 'TR1',
      actorId: 'U1',
      actorUserId: 'U1',
      actorCanManageAllUsers: false,
      tenantId: 'T1',
    })

    expect(result.status).toBe('completed')
    expect(writeAuditEvent).toHaveBeenCalledWith(
      db,
      expect.objectContaining({
        action: 'training.completed',
        resourceId: 'TR1',
      }),
    )
  })

  it('accepts optional certificateFileKey', async () => {
    const db = makeMarkCompletedDb({
      recordExists: true,
      courseExists: true,
      membershipExists: true,
    }) as unknown as MarkCompletedDb

    const result = await markCompleted(db, {
      recordId: 'TR1',
      actorId: 'U1',
      actorUserId: 'U1',
      actorCanManageAllUsers: false,
      tenantId: 'T1',
      certificateFileKey: 'evidence/T1/training-certificates/TR1/cert.pdf',
    })

    expect(result).toBeDefined()
    const updateSet = vi.mocked(db.update).mock.results[0]?.value.set
    expect(updateSet).toHaveBeenCalledWith(
      expect.objectContaining({
        certificateFileKey: 'evidence/T1/training-certificates/TR1/cert.pdf',
      }),
    )
    expect(writeAuditEvent).toHaveBeenCalledWith(
      db,
      expect.objectContaining({
        after: expect.objectContaining({
          hasCertificateEvidence: true,
        }),
      }),
    )
    expect(vi.mocked(writeAuditEvent).mock.calls.join(' ')).not.toContain(
      'evidence/T1/training-certificates/TR1/cert.pdf',
    )
  })

  it('rejects certificate keys outside the training record storage prefix', async () => {
    const db = makeMarkCompletedDb({
      recordExists: true,
      courseExists: true,
      membershipExists: true,
    }) as unknown as MarkCompletedDb

    await expect(
      markCompleted(db, {
        recordId: 'TR1',
        actorId: 'U1',
        actorUserId: 'U1',
        actorCanManageAllUsers: false,
        tenantId: 'T1',
        certificateFileKey: 'evidence/T1/training-certificates/other-record/cert.pdf',
      }),
    ).rejects.toThrow('Invalid training certificate key')

    expect(writeAuditEvent).not.toHaveBeenCalled()
  })

  it('does not audit stale completions when the update matches no rows', async () => {
    const db = makeMarkCompletedDb({
      recordExists: true,
      courseExists: true,
      membershipExists: true,
      updateReturns: false,
    }) as unknown as MarkCompletedDb & { updateSet: ReturnType<typeof vi.fn> }

    await expect(
      markCompleted(db, {
        recordId: 'TR1',
        actorId: 'U1',
        actorUserId: 'U1',
        actorCanManageAllUsers: false,
        tenantId: 'T1',
      }),
    ).rejects.toThrow('Training record changed before completion could be saved')

    expect(db.updateSet).toHaveBeenCalledWith(expect.objectContaining({ status: 'completed' }))
    expect(writeAuditEvent).not.toHaveBeenCalled()
  })

  it("throws when the record's course does not belong to the requesting tenant", async () => {
    const db = makeMarkCompletedDb({
      recordExists: true,
      courseExists: false,
      membershipExists: true,
    }) as unknown as MarkCompletedDb

    await expect(
      markCompleted(db, {
        recordId: 'TR1',
        actorId: 'U1',
        actorUserId: 'U1',
        actorCanManageAllUsers: true,
        tenantId: 'org-b',
      }),
    ).rejects.toThrow('Training record not found')
  })

  it("throws when the record's user has no membership in the requesting tenant", async () => {
    const db = makeMarkCompletedDb({
      recordExists: true,
      courseExists: true,
      membershipExists: false,
    }) as unknown as MarkCompletedDb

    await expect(
      markCompleted(db, {
        recordId: 'TR1',
        actorId: 'U1',
        actorUserId: 'U1',
        actorCanManageAllUsers: true,
        tenantId: 'org-b',
      }),
    ).rejects.toThrow('Training record not found')
  })

  it('throws when a non-admin tries to complete another users record', async () => {
    const db = makeMarkCompletedDb({
      recordExists: true,
      courseExists: true,
      membershipExists: true,
    }) as unknown as MarkCompletedDb

    await expect(
      markCompleted(db, {
        recordId: 'TR1',
        actorId: 'U2',
        actorUserId: 'U2',
        actorCanManageAllUsers: false,
        tenantId: 'T1',
      }),
    ).rejects.toThrow('Training record not found')

    expect(db.update).not.toHaveBeenCalled()
  })
})

describe('training record lifecycle mutations', () => {
  function makeTrainingRecordMutationDb(opts: {
    recordExists?: boolean
    membershipExists?: boolean
    updateReturns?: boolean
    deleteReturns?: boolean
    completedAt?: Date | null
  } = {}) {
    const record = {
      id: 'TR1',
      userId: 'U1',
      courseId: 'C1',
      status: opts.completedAt ? 'completed' : 'in_progress',
      completedAt: opts.completedAt ?? null,
      dueAt: new Date('2026-12-31T00:00:00.000Z'),
      certificateFileKey: opts.completedAt ? 'evidence/T1/training-certificates/TR1/cert.pdf' : null,
    }
    const updateSet = vi.fn((updates) => ({
      where: vi.fn().mockReturnValue({
        returning: vi
          .fn()
          .mockResolvedValue(opts.updateReturns === false ? [] : [{ ...record, ...updates }]),
      }),
    }))
    const deleteWhere = vi.fn().mockReturnValue({
      returning: vi
        .fn()
        .mockResolvedValue(opts.deleteReturns === false ? [] : [{ id: record.id }]),
    })

    let selectCallCount = 0
    const db = {
      select: vi.fn().mockImplementation(() => ({
        from: vi.fn().mockReturnThis(),
        innerJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockImplementation(() => {
          selectCallCount += 1

          if (selectCallCount === 1) {
            return Promise.resolve(
              opts.recordExists === false ? [] : [{ training_records: record }],
            )
          }

          return Promise.resolve(opts.membershipExists === false ? [] : [{ id: 'MBR2' }])
        }),
      })),
      update: vi.fn().mockReturnValue({ set: updateSet }),
      delete: vi.fn().mockReturnValue({ where: deleteWhere }),
      insert: vi.fn().mockReturnValue({ values: vi.fn().mockResolvedValue(undefined) }),
      transaction: vi.fn(),
      updateSet,
      deleteWhere,
    }
    db.transaction.mockImplementation((fn: (tx: typeof db) => Promise<unknown>) => fn(db))
    return db
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('does not audit stale unassignments when the delete matches no rows', async () => {
    const db = makeTrainingRecordMutationDb({ deleteReturns: false }) as unknown as
      TrainingRecordMutationDb & { deleteWhere: ReturnType<typeof vi.fn> }

    await expect(
      unassignTraining(db, {
        recordId: 'TR1',
        tenantId: 'T1',
        actorId: 'U1',
      }),
    ).rejects.toThrow('Training record changed before it could be unassigned')

    expect(db.deleteWhere).toHaveBeenCalled()
    expect(writeAuditEvent).not.toHaveBeenCalled()
  })

  it('does not audit stale reassignments when the update matches no rows', async () => {
    const db = makeTrainingRecordMutationDb({ updateReturns: false }) as unknown as
      Parameters<typeof reassignTraining>[0] & { updateSet: ReturnType<typeof vi.fn> }

    await expect(
      reassignTraining(db, {
        recordId: 'TR1',
        tenantId: 'T1',
        actorId: 'U1',
        newUserId: 'U2',
      }),
    ).rejects.toThrow('Training record changed before it could be reassigned')

    expect(db.updateSet).toHaveBeenCalledWith({ userId: 'U2' })
    expect(writeAuditEvent).not.toHaveBeenCalled()
  })

  it('does not audit stale due-date updates when the update matches no rows', async () => {
    const dueAt = new Date('2027-01-31T00:00:00.000Z')
    const db = makeTrainingRecordMutationDb({ updateReturns: false }) as unknown as
      Parameters<typeof updateTrainingDueDate>[0] & { updateSet: ReturnType<typeof vi.fn> }

    await expect(
      updateTrainingDueDate(db, {
        recordId: 'TR1',
        tenantId: 'T1',
        actorId: 'U1',
        dueAt,
      }),
    ).rejects.toThrow('Training record changed before the due date could be saved')

    expect(db.updateSet).toHaveBeenCalledWith({ dueAt })
    expect(writeAuditEvent).not.toHaveBeenCalled()
  })

  it('does not audit stale completion reopens when the update matches no rows', async () => {
    const db = makeTrainingRecordMutationDb({
      completedAt: new Date('2026-05-01T00:00:00.000Z'),
      updateReturns: false,
    }) as unknown as Parameters<typeof reopenTrainingCompletion>[0] & {
      updateSet: ReturnType<typeof vi.fn>
    }

    await expect(
      reopenTrainingCompletion(db, {
        recordId: 'TR1',
        tenantId: 'T1',
        actorId: 'U1',
      }),
    ).rejects.toThrow('Training record changed before completion could be reopened')

    expect(db.updateSet).toHaveBeenCalledWith({
      status: 'not_started',
      completedAt: null,
      certificateFileKey: null,
    })
    expect(writeAuditEvent).not.toHaveBeenCalled()
  })
})
