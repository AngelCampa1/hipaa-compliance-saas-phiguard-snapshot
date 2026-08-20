import { pgTable, uuid, text, boolean } from 'drizzle-orm/pg-core'
import { timestamps } from '@phiguard/db'
import { organizations } from '@phiguard/db'

// NOT .phi.ts - templates are not PHI; they are generic HIPAA checklist definitions
// tenantId is nullable: null = global starter template available to all tenants;
// non-null = clinic-specific custom template owned by that tenant.
export const checklistTemplates = pgTable('checklist_templates', {
  id: uuid('id').primaryKey().defaultRandom(),
  // null = global/built-in template; non-null = tenant-specific custom template
  // Using explicit nullable uuid (not tenantIdCol() which enforces notNull)
  tenantId: uuid('tenant_id').references(() => organizations.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  hipaaReference: text('hipaa_reference'), // e.g. "§164.308(a)(1)"
  isBuiltIn: boolean('is_built_in').notNull().default(false),
  ...timestamps(),
})

export type ChecklistTemplate = typeof checklistTemplates.$inferSelect
export type NewChecklistTemplate = typeof checklistTemplates.$inferInsert
