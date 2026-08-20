import { and, desc, eq } from 'drizzle-orm'
import { getTableColumns } from 'drizzle-orm'
import { writeAuditEvent } from '@phiguard/audit'
import type { DB } from '@phiguard/db'
import {
  locations,
  memberships,
  vendors,
  vendorBaas,
  type Vendor,
  type VendorBaa,
} from '@phiguard/db'
import { createTask } from '@phiguard/db/tasks'

const BAA_RENEWAL_LEAD_DAYS = 90
export const VENDOR_BAA_EXPIRING_SOON_DAYS = 60
export type VendorBaaState = 'missing' | 'current' | 'expiring' | 'expired'

function subtractDays(date: Date, days: number) {
  return new Date(date.getTime() - days * 24 * 60 * 60 * 1000)
}

export function selectLatestBaasByVendor<T extends { vendorId: string }>(rows: T[]): T[] {
  const latestByVendorId = new Map<string, T>()
  for (const row of rows) {
    if (!latestByVendorId.has(row.vendorId)) {
      latestByVendorId.set(row.vendorId, row)
    }
  }

  return [...latestByVendorId.values()]
}

export function getVendorBaaState(
  baa: { expiresAt: Date | string | null } | null | undefined,
  opts: { now?: Date; expiringSoonDays?: number } = {},
): VendorBaaState {
  if (!baa) return 'missing'
  if (!baa.expiresAt) return 'current'

  const now = opts.now ?? new Date()
  const expiringSoonDays = opts.expiringSoonDays ?? VENDOR_BAA_EXPIRING_SOON_DAYS
  const expiresAt = new Date(baa.expiresAt)
  if (Number.isNaN(expiresAt.getTime())) return 'expired'

  const cutoff = new Date(now.getTime() + expiringSoonDays * 24 * 60 * 60 * 1000)
  if (expiresAt < now) return 'expired'
  if (expiresAt <= cutoff) return 'expiring'
  return 'current'
}

async function listLatestBaasByVendor(db: DB, tenantId: string): Promise<VendorBaa[]> {
  // Join with vendors to enforce tenant isolation, then evaluate only the latest BAA per vendor.
  const rows = await db
    .select({ ...getTableColumns(vendorBaas) })
    .from(vendorBaas)
    .innerJoin(vendors, eq(vendorBaas.vendorId, vendors.id))
    .where(eq(vendors.tenantId, tenantId))
    .orderBy(desc(vendorBaas.signedAt), desc(vendorBaas.createdAt))

  return selectLatestBaasByVendor(rows as VendorBaa[])
}

async function assertTaskLocationBelongsToTenant(
  db: DB,
  input: {
    tenantId: string
    locationId: string
  },
) {
  const [location] = await db
    .select({ id: locations.id })
    .from(locations)
    .where(and(eq(locations.id, input.locationId), eq(locations.organizationId, input.tenantId)))
    .limit(1)

  if (!location) throw new Error('Task location not found')
}

async function assertVendorActorBelongsToTenant(
  db: Pick<DB, 'select'>,
  input: { tenantId: string; actorId: string },
) {
  const [membership] = await db
    .select({ id: memberships.id })
    .from(memberships)
    .where(and(eq(memberships.userId, input.actorId), eq(memberships.tenantId, input.tenantId)))
    .limit(1)

  if (!membership) {
    throw new Error('Vendor actor is not a member of this organization')
  }
}

function vendorAuditSummary(
  vendor: Pick<Vendor, 'website' | 'contactEmail' | 'dataCategories' | 'status'>,
) {
  return {
    websiteProvided: Boolean(vendor.website),
    contactEmailProvided: Boolean(vendor.contactEmail),
    dataCategoryCount: Array.isArray(vendor.dataCategories) ? vendor.dataCategories.length : 0,
    status: vendor.status,
  }
}

function vendorUpdateAuditSummary(before: Vendor, after: Vendor) {
  return {
    ...vendorAuditSummary(after),
    nameChanged: before.name !== after.name,
    websiteChanged: before.website !== after.website,
    contactEmailChanged: before.contactEmail !== after.contactEmail,
    dataCategoriesChanged:
      JSON.stringify(before.dataCategories ?? []) !== JSON.stringify(after.dataCategories ?? []),
  }
}

function vendorBaaAuditSummary(baa: VendorBaa) {
  return {
    baaId: baa.id,
    signedAt: baa.signedAt,
    expiresAt: baa.expiresAt,
  }
}

function assertVendorBaaDocumentKey(input: {
  tenantId: string
  vendorId: string
  documentFileKey: string
}) {
  const expectedPrefix = `evidence/${input.tenantId}/vendor-baas/${input.vendorId}/`
  if (
    !input.documentFileKey.startsWith(expectedPrefix) ||
    input.documentFileKey.length === expectedPrefix.length
  ) {
    throw new Error('Invalid vendor BAA document key')
  }
}

function vendorBaaUpdateAuditSummary(before: VendorBaa, after: VendorBaa) {
  return {
    ...vendorBaaAuditSummary(after),
    signerNameChanged: before.signerName !== after.signerName,
    signerEmailChanged: before.signerEmail !== after.signerEmail,
  }
}

async function getLatestVendorBaaForTenant(
  db: Pick<DB, 'select'>,
  input: { vendorId: string; tenantId: string },
): Promise<VendorBaa | undefined> {
  const rows = (await db
    .select()
    .from(vendorBaas)
    .innerJoin(vendors, eq(vendorBaas.vendorId, vendors.id))
    .where(and(eq(vendorBaas.vendorId, input.vendorId), eq(vendors.tenantId, input.tenantId)))
    .orderBy(desc(vendorBaas.signedAt), desc(vendorBaas.createdAt))
    .limit(1)) as Array<{ vendor_baas: VendorBaa }>

  return rows[0]?.vendor_baas
}

export async function createVendor(
  db: Pick<DB, 'select' | 'transaction'>,
  input: {
    tenantId: string
    actorId: string
    name: string
    website?: string
    contactEmail?: string
    dataCategories?: string[]
    baaTaskLocationId?: string
  },
) {
  await assertVendorActorBelongsToTenant(db, {
    tenantId: input.tenantId,
    actorId: input.actorId,
  })

  return db.transaction(async (tx) => {
    if (input.baaTaskLocationId) {
      await assertTaskLocationBelongsToTenant(tx as unknown as DB, {
        tenantId: input.tenantId,
        locationId: input.baaTaskLocationId,
      })
    }

    const [vendor] = await tx
      .insert(vendors)
      .values({
        tenantId: input.tenantId,
        name: input.name,
        website: input.website,
        contactEmail: input.contactEmail,
        dataCategories: input.dataCategories,
      })
      .returning()

    await writeAuditEvent(tx, {
      tenantId: input.tenantId,
      actorId: input.actorId,
      action: 'vendor.created',
      resourceType: 'vendor',
      resourceId: vendor.id,
      after: vendorAuditSummary(vendor),
    })

    if (input.baaTaskLocationId) {
      await createTask(tx as unknown as DB, {
        tenantId: input.tenantId,
        locationId: input.baaTaskLocationId,
        title: `Obtain BAA for ${vendor.name}`,
        description:
          'Confirm whether this vendor handles PHI, obtain an executed BAA before work begins, and attach the signed agreement to the vendor record.',
        priority: 'high',
        createdBy: input.actorId,
      })
    }

    return vendor
  })
}

export async function listExpiringSoon(
  db: DB,
  input: {
    tenantId: string
    withinDays: number
  },
): Promise<VendorBaa[]> {
  const now = new Date()
  const cutoff = new Date(now.getTime() + input.withinDays * 24 * 60 * 60 * 1000)

  return (await listLatestBaasByVendor(db, input.tenantId)).filter(
    (row) =>
      getVendorBaaState(row, { now, expiringSoonDays: input.withinDays }) === 'expiring' &&
      row.expiresAt !== null &&
      row.expiresAt <= cutoff,
  )
}

export async function listExpired(
  db: DB,
  input: {
    tenantId: string
  },
): Promise<VendorBaa[]> {
  const now = new Date()

  return (await listLatestBaasByVendor(db, input.tenantId)).filter(
    (row) => getVendorBaaState(row, { now }) === 'expired',
  )
}

export async function recordBaa(
  db: DB,
  input: {
    vendorId: string
    tenantId: string
    actorId: string
    signedAt: Date
    signerName: string
    signerEmail: string
    expiresAt?: Date
    documentFileKey?: string
    renewalTaskLocationId?: string
  },
): Promise<VendorBaa> {
  // Verify the vendor belongs to the requesting tenant
  const [vendor] = await db
    .select({ id: vendors.id, name: vendors.name })
    .from(vendors)
    .where(and(eq(vendors.id, input.vendorId), eq(vendors.tenantId, input.tenantId)))
    .limit(1)
  if (!vendor) throw new Error('Vendor not found')

  if (input.documentFileKey) {
    assertVendorBaaDocumentKey({
      tenantId: input.tenantId,
      vendorId: input.vendorId,
      documentFileKey: input.documentFileKey,
    })
  }

  await assertVendorActorBelongsToTenant(db, {
    tenantId: input.tenantId,
    actorId: input.actorId,
  })

  if (input.renewalTaskLocationId) {
    await assertTaskLocationBelongsToTenant(db, {
      tenantId: input.tenantId,
      locationId: input.renewalTaskLocationId,
    })
  }

  return db.transaction(async (tx) => {
    const [record] = await tx
      .insert(vendorBaas)
      .values({
        vendorId: input.vendorId,
        signedAt: input.signedAt,
        signerName: input.signerName,
        signerEmail: input.signerEmail,
        ...(input.expiresAt !== undefined ? { expiresAt: input.expiresAt } : {}),
        ...(input.documentFileKey !== undefined ? { documentFileKey: input.documentFileKey } : {}),
      })
      .returning()

    const isCurrentBaa = !input.expiresAt || input.expiresAt >= new Date()
    if (isCurrentBaa) {
      await tx
        .update(vendors)
        .set({ status: 'active' })
        .where(and(eq(vendors.id, input.vendorId), eq(vendors.tenantId, input.tenantId)))
    }

    await writeAuditEvent(tx, {
      tenantId: input.tenantId,
      actorId: input.actorId,
      action: 'vendor.baa_recorded',
      resourceType: 'vendor',
      resourceId: input.vendorId,
      after: {
        signedAt: input.signedAt,
        expiresAt: input.expiresAt,
        hasEvidence: Boolean(input.documentFileKey),
        ...(isCurrentBaa ? { status: 'active' } : {}),
      },
    })

    if (input.expiresAt && input.expiresAt >= new Date() && input.renewalTaskLocationId) {
      await createTask(tx as unknown as DB, {
        tenantId: input.tenantId,
        locationId: input.renewalTaskLocationId,
        title: `Review BAA renewal for ${vendor.name}`,
        description:
          'Review the vendor relationship and confirm the BAA remains current before the agreement expires.',
        priority: 'medium',
        dueAt: subtractDays(input.expiresAt, BAA_RENEWAL_LEAD_DAYS),
        createdBy: input.actorId,
      })
    }

    return record
  })
}

export async function markVendorInactive(
  db: DB,
  input: {
    vendorId: string
    tenantId: string
    actorId: string
  },
): Promise<void> {
  const [vendor] = await db
    .select({ id: vendors.id })
    .from(vendors)
    .where(and(eq(vendors.id, input.vendorId), eq(vendors.tenantId, input.tenantId)))
    .limit(1)

  if (!vendor) throw new Error('Vendor not found')

  await assertVendorActorBelongsToTenant(db, {
    tenantId: input.tenantId,
    actorId: input.actorId,
  })

  await db.transaction(async (tx) => {
    const [updated] = await tx
      .update(vendors)
      .set({ status: 'inactive' })
      .where(and(eq(vendors.id, input.vendorId), eq(vendors.tenantId, input.tenantId)))
      .returning({ id: vendors.id, status: vendors.status })

    if (!updated) {
      throw new Error('Vendor changed before it could be marked inactive')
    }

    await writeAuditEvent(tx, {
      tenantId: input.tenantId,
      actorId: input.actorId,
      action: 'vendor.inactivated',
      resourceType: 'vendor',
      resourceId: input.vendorId,
      after: { status: 'inactive' },
    })
  })
}

export async function updateVendor(
  db: DB,
  input: {
    vendorId: string
    tenantId: string
    actorId: string
    name?: string
    website?: string | null
    contactEmail?: string | null
    dataCategories?: string[]
  },
): Promise<Vendor> {
  const [vendor] = await db
    .select()
    .from(vendors)
    .where(and(eq(vendors.id, input.vendorId), eq(vendors.tenantId, input.tenantId)))
    .limit(1)

  if (!vendor) throw new Error('Vendor not found')

  await assertVendorActorBelongsToTenant(db, {
    tenantId: input.tenantId,
    actorId: input.actorId,
  })

  const setPayload: Partial<Vendor> = {}
  if (input.name !== undefined) setPayload.name = input.name
  if (input.website !== undefined) setPayload.website = input.website
  if (input.contactEmail !== undefined) setPayload.contactEmail = input.contactEmail
  if (input.dataCategories !== undefined) setPayload.dataCategories = input.dataCategories

  if (Object.keys(setPayload).length === 0) {
    throw new Error('At least one vendor field must be provided')
  }

  return db.transaction(async (tx) => {
    const [updated] = await tx
      .update(vendors)
      .set(setPayload)
      .where(and(eq(vendors.id, input.vendorId), eq(vendors.tenantId, input.tenantId)))
      .returning()

    if (!updated) {
      throw new Error('Vendor changed before the update could be saved')
    }

    await writeAuditEvent(tx, {
      tenantId: input.tenantId,
      actorId: input.actorId,
      action: 'vendor.updated',
      resourceType: 'vendor',
      resourceId: input.vendorId,
      before: vendorAuditSummary(vendor),
      after: vendorUpdateAuditSummary(vendor, updated),
    })

    return updated
  })
}

export async function reactivateVendor(
  db: DB,
  input: {
    vendorId: string
    tenantId: string
    actorId: string
  },
): Promise<Vendor> {
  const [vendor] = await db
    .select()
    .from(vendors)
    .where(and(eq(vendors.id, input.vendorId), eq(vendors.tenantId, input.tenantId)))
    .limit(1)

  if (!vendor) throw new Error('Vendor not found')

  await assertVendorActorBelongsToTenant(db, {
    tenantId: input.tenantId,
    actorId: input.actorId,
  })

  return db.transaction(async (tx) => {
    const [updated] = await tx
      .update(vendors)
      .set({ status: 'pending_baa' })
      .where(and(eq(vendors.id, input.vendorId), eq(vendors.tenantId, input.tenantId)))
      .returning()

    if (!updated) {
      throw new Error('Vendor changed before it could be reactivated')
    }

    await writeAuditEvent(tx, {
      tenantId: input.tenantId,
      actorId: input.actorId,
      action: 'vendor.reactivated',
      resourceType: 'vendor',
      resourceId: input.vendorId,
      before: { status: vendor.status },
      after: { status: updated.status },
    })

    return updated
  })
}

export async function listVendorBaas(
  db: DB,
  input: { vendorId: string; tenantId: string },
): Promise<VendorBaa[]> {
  const [vendor] = await db
    .select({ id: vendors.id })
    .from(vendors)
    .where(and(eq(vendors.id, input.vendorId), eq(vendors.tenantId, input.tenantId)))
    .limit(1)

  if (!vendor) throw new Error('Vendor not found')

  return db
    .select()
    .from(vendorBaas)
    .where(eq(vendorBaas.vendorId, input.vendorId))
    .orderBy(desc(vendorBaas.signedAt), desc(vendorBaas.createdAt))
}

export async function updateLatestVendorBaa(
  db: DB,
  input: {
    vendorId: string
    tenantId: string
    actorId: string
    signerName?: string
    signerEmail?: string
    signedAt?: Date
    expiresAt?: Date | null
  },
): Promise<VendorBaa> {
  const latestBaa = await getLatestVendorBaaForTenant(db, input)
  if (!latestBaa) throw new Error('No BAA found for this vendor')

  const baaId = latestBaa.id

  const setPayload: Partial<VendorBaa> = {}
  if (input.signerName !== undefined) setPayload.signerName = input.signerName
  if (input.signerEmail !== undefined) setPayload.signerEmail = input.signerEmail
  if (input.signedAt !== undefined) setPayload.signedAt = input.signedAt
  if (input.expiresAt !== undefined) setPayload.expiresAt = input.expiresAt

  if (Object.keys(setPayload).length === 0) {
    throw new Error('At least one BAA field must be provided')
  }

  await assertVendorActorBelongsToTenant(db, {
    tenantId: input.tenantId,
    actorId: input.actorId,
  })

  return db.transaction(async (tx) => {
    const latestBaaInTransaction = await getLatestVendorBaaForTenant(tx as unknown as DB, input)
    if (!latestBaaInTransaction || latestBaaInTransaction.id !== baaId) {
      throw new Error('Latest BAA changed before the update could be saved')
    }

    const [updated] = await tx
      .update(vendorBaas)
      .set(setPayload)
      .where(eq(vendorBaas.id, baaId))
      .returning()

    if (!updated) {
      throw new Error('BAA changed before the update could be saved')
    }

    await writeAuditEvent(tx, {
      tenantId: input.tenantId,
      actorId: input.actorId,
      action: 'vendor.baa_updated',
      resourceType: 'vendor',
      resourceId: input.vendorId,
      before: vendorBaaAuditSummary(latestBaaInTransaction),
      after: vendorBaaUpdateAuditSummary(latestBaaInTransaction, updated),
    })

    return updated
  })
}
