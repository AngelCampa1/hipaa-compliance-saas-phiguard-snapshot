import { integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core'

export const rateLimitBuckets = pgTable('rate_limit_buckets', {
  bucketKey: text('bucket_key').primaryKey(),
  tokens: integer('tokens').notNull(),
  lastRefill: timestamp('last_refill', { withTimezone: true }).notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow().$onUpdateFn(() => new Date()),
})

export type RateLimitBucket = typeof rateLimitBuckets.$inferSelect
export type NewRateLimitBucket = typeof rateLimitBuckets.$inferInsert
