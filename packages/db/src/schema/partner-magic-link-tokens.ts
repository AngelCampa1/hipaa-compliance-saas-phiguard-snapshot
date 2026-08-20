import { index, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { partnerUsers } from './partner-users.js'
import { timestamps } from './_conventions.js'

export const partnerMagicLinkTokens = pgTable(
  'partner_magic_link_tokens',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    partnerUserId: uuid('partner_user_id')
      .notNull()
      .references(() => partnerUsers.id, { onDelete: 'cascade' }),
    tokenHash: text('token_hash').notNull().unique(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    usedAt: timestamp('used_at', { withTimezone: true }),
    ...timestamps(),
  },
  (table) => [
    index('partner_magic_link_tokens_partner_user_id_idx').on(table.partnerUserId),
    index('partner_magic_link_tokens_expires_at_idx').on(table.expiresAt),
  ],
)

export type PartnerMagicLinkToken = typeof partnerMagicLinkTokens.$inferSelect
