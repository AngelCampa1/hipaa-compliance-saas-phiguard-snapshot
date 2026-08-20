import { pgTable, primaryKey, text, timestamp } from 'drizzle-orm/pg-core'

export const processedWebhookEvents = pgTable(
  'processed_webhook_events',
  {
    provider: text('provider').notNull(),
    eventId: text('event_id').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.provider, t.eventId] })],
)
