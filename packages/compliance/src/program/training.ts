import { and, eq } from 'drizzle-orm'
import { writeAuditEvent } from '@phiguard/audit'
import type { DB } from '@phiguard/db'
import {
  trainingCourses,
  trainingRecords,
  memberships,
  type TrainingCourse,
  type TrainingRecord,
} from '@phiguard/db'

const DUE_SOON_DAYS = 7

function trainingCourseAuditMetadata(course: Pick<TrainingCourse, 'frequencyDays' | 'isActive'>) {
  return {
    frequencyDays: course.frequencyDays,
    isActive: course.isActive,
  }
}

async function assertTrainingUserBelongsToTenant(
  db: Pick<DB, 'select'>,
  input: { tenantId: string; userId: string; errorMessage: string },
) {
  const [membership] = await db
    .select({ id: memberships.id })
    .from(memberships)
    .where(and(eq(memberships.userId, input.userId), eq(memberships.tenantId, input.tenantId)))
    .limit(1)

  if (!membership) {
    throw new Error(input.errorMessage)
  }
}

async function assertTrainingActorBelongsToTenant(
  db: Pick<DB, 'select'>,
  input: { tenantId: string; actorId: string },
) {
  await assertTrainingUserBelongsToTenant(db, {
    tenantId: input.tenantId,
    userId: input.actorId,
    errorMessage: 'Training actor is not a member of this organization',
  })
}

function assertTrainingCertificateKey(input: {
  tenantId: string
  recordId: string
  certificateFileKey: string
}) {
  const expectedPrefix = `evidence/${input.tenantId}/training-certificates/${input.recordId}/`
  if (
    !input.certificateFileKey.startsWith(expectedPrefix) ||
    input.certificateFileKey.length === expectedPrefix.length
  ) {
    throw new Error('Invalid training certificate key')
  }
}

export function computeDueStatus(
  record: { status: string; dueAt: Date },
  now: Date,
): 'overdue' | 'due_soon' | 'ok' | 'not_started' {
  if (record.status === 'completed') {
    return 'ok'
  }

  const msUntilDue = record.dueAt.getTime() - now.getTime()

  if (msUntilDue < 0) {
    return 'overdue'
  }

  const daysUntilDue = msUntilDue / (1000 * 60 * 60 * 24)

  if (daysUntilDue <= DUE_SOON_DAYS) {
    return 'due_soon'
  }

  if (record.status === 'not_started') return 'not_started'

  return 'ok'
}

export async function assignCourse(
  db: DB,
  input: {
    tenantId: string
    actorId: string
    userId: string
    courseId: string
    dueAt: Date
  },
): Promise<TrainingRecord> {
  const [course] = await db
    .select({ id: trainingCourses.id })
    .from(trainingCourses)
    .where(
      and(
        eq(trainingCourses.id, input.courseId),
        eq(trainingCourses.tenantId, input.tenantId),
        eq(trainingCourses.isActive, true),
      ),
    )
    .limit(1)

  if (!course) {
    throw new Error('Training course not found')
  }

  await assertTrainingActorBelongsToTenant(db, {
    tenantId: input.tenantId,
    actorId: input.actorId,
  })
  await assertTrainingUserBelongsToTenant(db, {
    tenantId: input.tenantId,
    userId: input.userId,
    errorMessage: 'User not found in organization',
  })

  const [insertedRecord] = await db.transaction(async (tx) => {
    const [record] = await tx
      .insert(trainingRecords)
      .values({
        userId: input.userId,
        courseId: input.courseId,
        status: 'not_started',
        dueAt: input.dueAt,
      })
      .onConflictDoNothing({
        target: [trainingRecords.userId, trainingRecords.courseId],
      })
      .returning()

    if (record) {
      await writeAuditEvent(tx, {
        tenantId: input.tenantId,
        actorId: input.actorId,
        action: 'training.assigned',
        resourceType: 'training_record',
        resourceId: record.id,
        after: {
          userId: input.userId,
          courseId: input.courseId,
          dueAt: input.dueAt,
          status: 'not_started',
        },
      })
    }

    return [record]
  })

  if (insertedRecord) {
    return insertedRecord
  }

  const [existingRecord] = await db
    .select()
    .from(trainingRecords)
    .where(
      and(eq(trainingRecords.userId, input.userId), eq(trainingRecords.courseId, input.courseId)),
    )
    .limit(1)

  if (!existingRecord) {
    throw new Error('Training assignment could not be created')
  }

  return existingRecord
}

export async function createTrainingCourse(
  db: DB,
  input: {
    tenantId: string
    actorId: string
    title: string
    description?: string | null
    frequencyDays: number
  },
): Promise<TrainingCourse> {
  await assertTrainingActorBelongsToTenant(db, {
    tenantId: input.tenantId,
    actorId: input.actorId,
  })

  return db.transaction(async (tx) => {
    const [course] = await tx
      .insert(trainingCourses)
      .values({
        tenantId: input.tenantId,
        title: input.title,
        description: input.description ?? null,
        frequencyDays: input.frequencyDays,
        isActive: true,
      })
      .returning()

    await writeAuditEvent(tx, {
      tenantId: input.tenantId,
      actorId: input.actorId,
      action: 'training_course.created',
      resourceType: 'training_course',
      resourceId: course.id,
      after: trainingCourseAuditMetadata(course),
    })

    return course
  })
}

export async function deactivateTrainingCourse(
  db: DB,
  input: {
    tenantId: string
    actorId: string
    courseId: string
  },
): Promise<void> {
  const [course] = await db
    .select()
    .from(trainingCourses)
    .where(
      and(eq(trainingCourses.id, input.courseId), eq(trainingCourses.tenantId, input.tenantId)),
    )
    .limit(1)

  if (!course) {
    throw new Error('Training course not found')
  }

  await assertTrainingActorBelongsToTenant(db, {
    tenantId: input.tenantId,
    actorId: input.actorId,
  })

  await db.transaction(async (tx) => {
    const [updated] = await tx
      .update(trainingCourses)
      .set({ isActive: false })
      .where(
        and(eq(trainingCourses.id, input.courseId), eq(trainingCourses.tenantId, input.tenantId)),
      )
      .returning({ id: trainingCourses.id })

    if (!updated) {
      throw new Error('Training course changed before it could be deactivated')
    }

    await writeAuditEvent(tx, {
      tenantId: input.tenantId,
      actorId: input.actorId,
      action: 'training_course.deactivated',
      resourceType: 'training_course',
      resourceId: input.courseId,
      before: trainingCourseAuditMetadata(course),
      after: { isActive: false },
    })
  })
}

export async function markCompleted(
  db: DB,
  input: {
    recordId: string
    actorId: string
    actorUserId: string
    actorCanManageAllUsers: boolean
    tenantId: string
    certificateFileKey?: string
  },
): Promise<TrainingRecord> {
  const [current] = await db
    .select()
    .from(trainingRecords)
    .where(eq(trainingRecords.id, input.recordId))
    .limit(1)

  if (!current) {
    throw new Error('Training record not found')
  }

  const [course] = await db
    .select({ id: trainingCourses.id })
    .from(trainingCourses)
    .where(
      and(eq(trainingCourses.id, current.courseId), eq(trainingCourses.tenantId, input.tenantId)),
    )
    .limit(1)

  if (!course) {
    throw new Error('Training record not found')
  }

  await assertTrainingUserBelongsToTenant(db, {
    tenantId: input.tenantId,
    userId: current.userId,
    errorMessage: 'Training record not found',
  })

  if (!input.actorCanManageAllUsers && current.userId !== input.actorUserId) {
    throw new Error('Training record not found')
  }
  await assertTrainingActorBelongsToTenant(db, {
    tenantId: input.tenantId,
    actorId: input.actorUserId,
  })
  if (input.certificateFileKey) {
    assertTrainingCertificateKey({
      tenantId: input.tenantId,
      recordId: input.recordId,
      certificateFileKey: input.certificateFileKey,
    })
  }

  const now = new Date()

  return db.transaction(async (tx) => {
    const [updated] = await tx
      .update(trainingRecords)
      .set({
        status: 'completed',
        completedAt: now,
        ...(input.certificateFileKey !== undefined
          ? { certificateFileKey: input.certificateFileKey }
          : {}),
      })
      .where(eq(trainingRecords.id, input.recordId))
      .returning()

    if (!updated) {
      throw new Error('Training record changed before completion could be saved')
    }

    await writeAuditEvent(tx, {
      tenantId: input.tenantId,
      actorId: input.actorId,
      action: 'training.completed',
      resourceType: 'training_record',
      resourceId: input.recordId,
      before: { status: current.status },
      after: {
        status: 'completed',
        completedAt: now,
        ...(input.certificateFileKey !== undefined ? { hasCertificateEvidence: true } : {}),
      },
    })

    return updated
  })
}

async function requireTrainingRecord(
  db: DB,
  input: { recordId: string; tenantId: string },
): Promise<TrainingRecord> {
  const [record] = await db
    .select()
    .from(trainingRecords)
    .innerJoin(trainingCourses, eq(trainingRecords.courseId, trainingCourses.id))
    .where(
      and(
        eq(trainingRecords.id, input.recordId),
        eq(trainingCourses.tenantId, input.tenantId),
      ),
    )
    .limit(1)

  if (!record) throw new Error('Training record not found')

  return record.training_records
}

export async function unassignTraining(
  db: DB,
  input: {
    recordId: string
    tenantId: string
    actorId: string
  },
): Promise<void> {
  const record = await requireTrainingRecord(db, { recordId: input.recordId, tenantId: input.tenantId })

  if (record.completedAt) {
    throw new Error('Completed training records cannot be unassigned. Use reopen first.')
  }

  await assertTrainingActorBelongsToTenant(db, {
    tenantId: input.tenantId,
    actorId: input.actorId,
  })

  await db.transaction(async (tx) => {
    const [deleted] = await tx
      .delete(trainingRecords)
      .where(eq(trainingRecords.id, input.recordId))
      .returning({ id: trainingRecords.id })

    if (!deleted) {
      throw new Error('Training record changed before it could be unassigned')
    }

    await writeAuditEvent(tx, {
      tenantId: input.tenantId,
      actorId: input.actorId,
      action: 'training.unassigned',
      resourceType: 'training_record',
      resourceId: input.recordId,
      before: { userId: record.userId, courseId: record.courseId },
    })
  })
}

export async function reassignTraining(
  db: DB,
  input: {
    recordId: string
    tenantId: string
    actorId: string
    newUserId: string
  },
): Promise<TrainingRecord> {
  const record = await requireTrainingRecord(db, { recordId: input.recordId, tenantId: input.tenantId })

  await assertTrainingActorBelongsToTenant(db, {
    tenantId: input.tenantId,
    actorId: input.actorId,
  })
  await assertTrainingUserBelongsToTenant(db, {
    tenantId: input.tenantId,
    userId: input.newUserId,
    errorMessage: 'User not found in organization',
  })

  return db.transaction(async (tx) => {
    const [updated] = await tx
      .update(trainingRecords)
      .set({ userId: input.newUserId })
      .where(eq(trainingRecords.id, input.recordId))
      .returning()

    if (!updated) {
      throw new Error('Training record changed before it could be reassigned')
    }

    await writeAuditEvent(tx, {
      tenantId: input.tenantId,
      actorId: input.actorId,
      action: 'training.reassigned',
      resourceType: 'training_record',
      resourceId: input.recordId,
      before: { userId: record.userId },
      after: { userId: input.newUserId },
    })

    return updated
  })
}

export async function updateTrainingDueDate(
  db: DB,
  input: {
    recordId: string
    tenantId: string
    actorId: string
    dueAt: Date
  },
): Promise<TrainingRecord> {
  const record = await requireTrainingRecord(db, { recordId: input.recordId, tenantId: input.tenantId })

  await assertTrainingActorBelongsToTenant(db, {
    tenantId: input.tenantId,
    actorId: input.actorId,
  })

  return db.transaction(async (tx) => {
    const [updated] = await tx
      .update(trainingRecords)
      .set({ dueAt: input.dueAt })
      .where(eq(trainingRecords.id, input.recordId))
      .returning()

    if (!updated) {
      throw new Error('Training record changed before the due date could be saved')
    }

    await writeAuditEvent(tx, {
      tenantId: input.tenantId,
      actorId: input.actorId,
      action: 'training.due_date_updated',
      resourceType: 'training_record',
      resourceId: input.recordId,
      before: { dueAt: record.dueAt },
      after: { dueAt: input.dueAt },
    })

    return updated
  })
}

export async function reactivateTrainingCourse(
  db: DB,
  input: {
    courseId: string
    tenantId: string
    actorId: string
  },
): Promise<TrainingCourse> {
  const [course] = await db
    .select()
    .from(trainingCourses)
    .where(and(eq(trainingCourses.id, input.courseId), eq(trainingCourses.tenantId, input.tenantId)))
    .limit(1)

  if (!course) throw new Error('Training course not found')

  await assertTrainingActorBelongsToTenant(db, {
    tenantId: input.tenantId,
    actorId: input.actorId,
  })

  return db.transaction(async (tx) => {
    const [updated] = await tx
      .update(trainingCourses)
      .set({ isActive: true })
      .where(and(eq(trainingCourses.id, input.courseId), eq(trainingCourses.tenantId, input.tenantId)))
      .returning()

    if (!updated) {
      throw new Error('Training course changed before it could be reactivated')
    }

    await writeAuditEvent(tx, {
      tenantId: input.tenantId,
      actorId: input.actorId,
      action: 'training_course.reactivated',
      resourceType: 'training_course',
      resourceId: input.courseId,
      before: { isActive: false },
      after: { isActive: true },
    })

    return updated
  })
}

export async function reopenTrainingCompletion(
  db: DB,
  input: {
    recordId: string
    tenantId: string
    actorId: string
  },
): Promise<TrainingRecord> {
  const record = await requireTrainingRecord(db, { recordId: input.recordId, tenantId: input.tenantId })

  if (!record.completedAt) {
    throw new Error('Training record is not completed')
  }

  await assertTrainingActorBelongsToTenant(db, {
    tenantId: input.tenantId,
    actorId: input.actorId,
  })

  return db.transaction(async (tx) => {
    const [updated] = await tx
      .update(trainingRecords)
      .set({ status: 'not_started', completedAt: null, certificateFileKey: null })
      .where(eq(trainingRecords.id, input.recordId))
      .returning()

    if (!updated) {
      throw new Error('Training record changed before completion could be reopened')
    }

    await writeAuditEvent(tx, {
      tenantId: input.tenantId,
      actorId: input.actorId,
      action: 'training.completion_reopened',
      resourceType: 'training_record',
      resourceId: input.recordId,
      before: { status: 'completed' },
      after: { status: 'not_started' },
    })

    return updated
  })
}
