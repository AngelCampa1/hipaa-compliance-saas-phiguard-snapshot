import { createFileRoute } from '@tanstack/react-router'
import { buildReadinessResponse } from '../server/health.js'

export const Route = createFileRoute('/readyz')({
  server: {
    handlers: {
      GET: async () => buildReadinessResponse(),
    },
  },
})
