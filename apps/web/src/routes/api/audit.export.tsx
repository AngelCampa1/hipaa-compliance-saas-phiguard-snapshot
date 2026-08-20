import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { LEGAL_ONBOARDING_REQUIRED_MESSAGE } from '../../lib/legal-gate.js'
import { captureServerException } from '../../lib/sentry.js'
import {
  AUDIT_EXPORT_ROW_LIMIT_MESSAGE,
  ExportAuditCsvInput,
  createAuditCsvDownloadResponse,
} from '../../server/audit.js'

function isForbiddenAuditExportError(message: string) {
  return (
    message === 'No active organization' ||
    message === 'Location not found or access denied' ||
    message === LEGAL_ONBOARDING_REQUIRED_MESSAGE ||
    message === 'Choose a plan before accessing PHIGuard.' ||
    message === 'Start the trial before accessing PHIGuard.' ||
    message === 'Billing action required before accessing PHIGuard.' ||
    message.startsWith('Access denied:')
  )
}

async function handleAuditExport(request: Request) {
  try {
    const url = new URL(request.url)
    const input = ExportAuditCsvInput.parse({
      dateFrom: url.searchParams.get('dateFrom'),
      dateTo: url.searchParams.get('dateTo'),
      actorId: url.searchParams.get('actorId') ?? undefined,
      actorEmail: url.searchParams.get('actorEmail') ?? undefined,
      action: url.searchParams.get('action') ?? undefined,
      resourceType: url.searchParams.get('resourceType') ?? undefined,
      resourceId: url.searchParams.get('resourceId') ?? undefined,
      search: url.searchParams.get('search') ?? undefined,
      locationId: url.searchParams.get('locationId') ?? undefined,
    })

    return await createAuditCsvDownloadResponse(request, input)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response('Bad Request', { status: 400 })
    }

    const message = error instanceof Error ? error.message : String(error)

    if (message === 'Unauthorized') {
      return new Response('Unauthorized', { status: 401 })
    }

    if (isForbiddenAuditExportError(message)) {
      return new Response('Forbidden', { status: 403 })
    }

    if (message === AUDIT_EXPORT_ROW_LIMIT_MESSAGE) {
      return new Response(AUDIT_EXPORT_ROW_LIMIT_MESSAGE, { status: 413 })
    }

    captureServerException(error, {
      surface: 'api',
      route: '/api/audit/export',
      operation: 'audit.csv.export',
      status: 500,
    })
    return new Response('Internal Server Error', { status: 500 })
  }
}

export const Route = createFileRoute('/api/audit/export')({
  server: {
    handlers: {
      GET: async ({ request }) => handleAuditExport(request),
    },
  },
})
