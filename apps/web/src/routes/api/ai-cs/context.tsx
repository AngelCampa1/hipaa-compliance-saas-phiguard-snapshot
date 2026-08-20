import { createFileRoute } from '@tanstack/react-router'
import { handleAiCsContextRequest } from '../../../server/ai-cs-context.server.js'

export const Route = createFileRoute('/api/ai-cs/context')({
  server: {
    handlers: {
      GET: async ({ request }) => handleAiCsContextRequest(request),
    },
  },
})
