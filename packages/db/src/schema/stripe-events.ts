import { pgTable, text, timestamp } from 'drizzle-orm/pg-core'

export const processedStripeEvents = pgTable('processed_stripe_events', {
  id: text('id').primaryKey(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})
