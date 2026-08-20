import { writeAuditEvent } from './write.js'
import type { WriteAuditEventInput, AuditDb } from './write.js'

// A DB handle that supports both insert (for writeAuditEvent) and transactions.
// Drizzle's PostgresJsDatabase and its transaction handles both satisfy this shape.
export type TransactionalAuditDb = AuditDb & {
  transaction: <T>(fn: (tx: TransactionalAuditDb) => Promise<T>) => Promise<T>
}

/**
 * Execute a database mutation and write an audit event atomically in a single
 * transaction. If either the mutation or the audit write fails, both are rolled
 * back - no mutation without a trail, no trail without a mutation.
 *
 * The mutation receives the transaction handle so it can participate in the
 * same transaction that the audit write uses.
 */
export async function auditedWrite<T>(
  db: TransactionalAuditDb,
  mutationFn: (tx: TransactionalAuditDb) => Promise<T>,
  eventFactory: (result: T) => WriteAuditEventInput,
): Promise<T> {
  return db.transaction(async (tx) => {
    const result = await mutationFn(tx)
    await writeAuditEvent(tx, eventFactory(result))
    return result
  })
}
