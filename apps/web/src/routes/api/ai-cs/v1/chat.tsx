import { createFileRoute } from '@tanstack/react-router'
import { handleAiCsProxyRequest } from '../../../../server/ai-cs-proxy.server.js'

export const Route = createFileRoute('/api/ai-cs/v1/chat')({
  server: {
    handlers: {
      POST: async ({ request }) => handleAiCsProxyRequest(request, 'chat'),
    },
  },
})
