import { createFileRoute } from '@tanstack/react-router'
import { createEvidenceBundleDownloadResponse } from '../../../server/soc2.js'
import { captureServerException } from '../../../lib/sentry.js'

export const Route = createFileRoute('/api/soc2/bundles')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          return await createEvidenceBundleDownloadResponse(request)
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error)

          if (message === 'Unauthorized') {
            return new Response('Unauthorized', { status: 401 })
          }

          if (
            message === 'Only administrators can download evidence bundles' ||
            message.startsWith('Access denied:')
          ) {
            return new Response('Forbidden', { status: 403 })
          }

          captureServerException(error, {
            surface: 'api',
            route: '/api/soc2/bundles',
            operation: 'soc2.bundle.download',
            status: 500,
          })
          return new Response('Internal Server Error', { status: 500 })
        }
      },
    },
  },
})
