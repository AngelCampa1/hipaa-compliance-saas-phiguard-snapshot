import { createFileRoute } from '@tanstack/react-router'
import { buildLivenessResponse } from '../server/health.js'

export const Route = createFileRoute('/health')({
  server: {
    handlers: {
      GET: async () => buildLivenessResponse(),
    },
  },
})
