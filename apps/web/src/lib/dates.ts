// Re-export the shared date formatter from @phiguard/ui so the product app
// has a single source of truth for date formatting.
// See packages/ui/src/lib/format.ts for the implementation.
export { formatDate, formatDateTime } from '@phiguard/ui'
