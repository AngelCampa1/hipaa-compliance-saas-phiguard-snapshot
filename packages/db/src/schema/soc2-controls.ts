import { pgTable, text, uuid, pgEnum } from 'drizzle-orm/pg-core'
import { timestamps } from './_conventions.js'

export const soc2FrameworkEnum = pgEnum('soc2_framework', ['SOC2'])
export const soc2ControlCategoryEnum = pgEnum('soc2_control_category', [
  'CC1', 'CC2', 'CC3', 'CC4', 'CC5', 'CC6', 'CC7', 'CC8', 'CC9',
  'A1', 'C1', 'PI1', 'P1',
])

export const soc2Controls = pgTable('soc2_controls', {
  id: uuid('id').primaryKey().defaultRandom(),
  framework: soc2FrameworkEnum('framework').notNull().default('SOC2'),
  controlId: text('control_id').notNull(), // e.g. 'CC6.1'
  title: text('title').notNull(),
  description: text('description').notNull(),
  category: soc2ControlCategoryEnum('category').notNull(),
  tenantId: uuid('tenant_id'), // null = global default
  ...timestamps(),
})

export type Soc2Control = typeof soc2Controls.$inferSelect
export type NewSoc2Control = typeof soc2Controls.$inferInsert
