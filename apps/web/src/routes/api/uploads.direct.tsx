import { createFileRoute } from '@tanstack/react-router'
import { getDb } from '@phiguard/db/server'
import { getSessionFn } from '../../lib/session.js'
import {
  ALLOWED_UPLOAD_CONTENT_TYPES,
  MAX_UPLOAD_BYTES,
  getUploadedObject,
  isMockUploadsEnabled,
  putUploadedObject,
  UPLOAD_OBJECT_ALREADY_EXISTS_MESSAGE,
  verifyDirectDownloadCapability,
  verifyDirectUploadCapability,
} from '../../lib/s3.js'
import {
  assertCommercialProductAccess,
  canWriteLocations,
  resolveActiveLocationAccess,
} from '../../server/access.js'
import { isAllowedUploadKey } from '../../lib/upload-keys.js'
import { captureServerProductAnalyticsEvent } from '../../lib/product-analytics.js'

type ScanLookup = {
  avStatus: string
}

type UploadScanQueryDb = {
  query?: {
    taskAttachments?: {
      findFirst(input: unknown): Promise<ScanLookup | null | undefined>
    }
    evidenceFileScans?: {
      findFirst(input: unknown): Promise<ScanLookup | null | undefined>
    }
  }
}

type DirectUploadFailureReason =
  | 'access_denied'
  | 'invalid_key'
  | 'invalid_capability'
  | 'invalid_file_type'
  | 'too_large'
  | 'reused_capability'
  | 'missing_body'

function getDirectUploadCategory(key: string, organizationId: string) {
  if (key.startsWith(`attachments/${organizationId}/`)) return 'task_attachment'
  if (key.startsWith(`evidence/${organizationId}/vendor-baas/`)) return 'vendor_baa'
  if (key.startsWith(`evidence/${organizationId}/training-certificates/`)) {
    return 'training_certificate'
  }
  return 'unknown'
}

function captureDirectUploadEvent(input: {
  userId: string
  organizationId: string
  eventName: 'file_upload_completed' | 'file_upload_failed'
  key: string
  status: 'completed' | 'failed'
  reason?: DirectUploadFailureReason
}) {
  captureServerProductAnalyticsEvent({
    userId: input.userId,
    organizationId: input.organizationId,
    eventName: input.eventName,
    properties: {
      route: '/api/uploads/direct',
      category: getDirectUploadCategory(input.key, input.organizationId),
      status: input.status,
      reason: input.reason,
    },
  })
}

async function hasExistingUploadScanRecord(db: unknown, organizationId: string, key: string) {
  const queryDb = db as UploadScanQueryDb

  const whereByTenantAndKey = (
    fields: { tenantId: unknown; s3Key: unknown },
    operators: {
      and: (...conditions: unknown[]) => unknown
      eq: (left: unknown, right: unknown) => unknown
    },
  ) => operators.and(operators.eq(fields.tenantId, organizationId), operators.eq(fields.s3Key, key))

  const taskScan = key.startsWith(`attachments/${organizationId}/`)
    ? await queryDb.query?.taskAttachments?.findFirst({
        where: whereByTenantAndKey,
      })
    : null
  if (taskScan) {
    return true
  }

  const evidenceScan = key.startsWith(`evidence/${organizationId}/`)
    ? await queryDb.query?.evidenceFileScans?.findFirst({
        where: whereByTenantAndKey,
      })
    : null

  return Boolean(evidenceScan)
}

async function readUploadBody(request: Request, maxBytes: number) {
  if (!request.body) {
    throw new Error('Missing upload body')
  }

  const reader = request.body.getReader()
  const chunks: Uint8Array[] = []
  let totalBytes = 0

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    if (!value) continue

    totalBytes += value.byteLength
    if (totalBytes > maxBytes) {
      await reader.cancel().catch(() => {})
      return null
    }
    chunks.push(value)
  }

  const body = new Uint8Array(totalBytes)
  let offset = 0
  for (const chunk of chunks) {
    body.set(chunk, offset)
    offset += chunk.byteLength
  }

  return body
}

export async function handleDirectUpload(request: Request) {
  if (isMockUploadsEnabled()) {
    return new Response('Not Found', { status: 404 })
  }

  const session = await getSessionFn()
  if (!session?.user?.id || !session.session.activeOrganizationId) {
    return new Response('Unauthorized', { status: 401 })
  }

  const db = getDb()
  let organizationId: string | null = null
  try {
    const access = await resolveActiveLocationAccess(db, session)
    if (access.userId !== session.user.id) {
      return new Response('Unauthorized', { status: 401 })
    }
    organizationId = access.organizationId
    assertCommercialProductAccess(access)
    if (!canWriteLocations(access)) {
      captureDirectUploadEvent({
        userId: session.user.id,
        organizationId,
        eventName: 'file_upload_failed',
        key: '',
        status: 'failed',
        reason: 'access_denied',
      })
      return new Response('Read-only users cannot upload files', {
        status: 403,
      })
    }
  } catch (error) {
    if (organizationId) {
      captureDirectUploadEvent({
        userId: session.user.id,
        organizationId,
        eventName: 'file_upload_failed',
        key: '',
        status: 'failed',
        reason: 'access_denied',
      })
    }
    const message = error instanceof Error ? error.message : 'Unauthorized'
    const status = message === 'Unauthorized' || message === 'No active organization' ? 401 : 403
    return new Response(message, { status })
  }

  const url = new URL(request.url)
  const key = url.searchParams.get('key')?.trim() ?? ''
  if (!key || !isAllowedUploadKey(key, organizationId)) {
    captureDirectUploadEvent({
      userId: session.user.id,
      organizationId,
      eventName: 'file_upload_failed',
      key,
      status: 'failed',
      reason: 'invalid_key',
    })
    return new Response('Invalid upload key', { status: 400 })
  }

  let capability: ReturnType<typeof verifyDirectUploadCapability>
  try {
    capability = verifyDirectUploadCapability(url.searchParams.get('token'))
  } catch {
    capability = null
  }
  if (
    !capability ||
    capability.organizationId !== organizationId ||
    capability.key !== key
  ) {
    captureDirectUploadEvent({
      userId: session.user.id,
      organizationId,
      eventName: 'file_upload_failed',
      key,
      status: 'failed',
      reason: 'invalid_capability',
    })
    return new Response('Invalid upload capability', { status: 403 })
  }

  const contentType = request.headers.get('content-type')
  if (
    !contentType ||
    !ALLOWED_UPLOAD_CONTENT_TYPES.has(contentType) ||
    contentType !== capability.contentType
  ) {
    captureDirectUploadEvent({
      userId: session.user.id,
      organizationId,
      eventName: 'file_upload_failed',
      key,
      status: 'failed',
      reason: 'invalid_file_type',
    })
    return new Response('File type not allowed', { status: 400 })
  }

  const maxBytes = Math.min(capability.maxBytes, MAX_UPLOAD_BYTES)
  const contentLength = Number(request.headers.get('content-length') ?? 0)
  if (Number.isFinite(contentLength) && contentLength > maxBytes) {
    captureDirectUploadEvent({
      userId: session.user.id,
      organizationId,
      eventName: 'file_upload_failed',
      key,
      status: 'failed',
      reason: 'too_large',
    })
    return new Response('File exceeds 25 MB limit', { status: 413 })
  }

  if (await hasExistingUploadScanRecord(db, organizationId, key)) {
    captureDirectUploadEvent({
      userId: session.user.id,
      organizationId,
      eventName: 'file_upload_failed',
      key,
      status: 'failed',
      reason: 'reused_capability',
    })
    return new Response('Upload capability has already been used', {
      status: 409,
    })
  }

  if (!request.body) {
    captureDirectUploadEvent({
      userId: session.user.id,
      organizationId,
      eventName: 'file_upload_failed',
      key,
      status: 'failed',
      reason: 'missing_body',
    })
    return new Response('Missing upload body', { status: 400 })
  }

  const body = await readUploadBody(request, maxBytes)
  if (!body) {
    captureDirectUploadEvent({
      userId: session.user.id,
      organizationId,
      eventName: 'file_upload_failed',
      key,
      status: 'failed',
      reason: 'too_large',
    })
    return new Response('File exceeds 25 MB limit', { status: 413 })
  }
  if (body.byteLength === 0) {
    captureDirectUploadEvent({
      userId: session.user.id,
      organizationId,
      eventName: 'file_upload_failed',
      key,
      status: 'failed',
      reason: 'missing_body',
    })
    return new Response('Missing upload body', { status: 400 })
  }

  try {
    await putUploadedObject({
      key,
      body,
      contentType,
      rejectIfExists: true,
    })
  } catch (error) {
    if (error instanceof Error && error.message === UPLOAD_OBJECT_ALREADY_EXISTS_MESSAGE) {
      captureDirectUploadEvent({
        userId: session.user.id,
        organizationId,
        eventName: 'file_upload_failed',
        key,
        status: 'failed',
        reason: 'reused_capability',
      })
      return new Response(UPLOAD_OBJECT_ALREADY_EXISTS_MESSAGE, {
        status: 409,
      })
    }

    throw error
  }

  captureDirectUploadEvent({
    userId: session.user.id,
    organizationId,
    eventName: 'file_upload_completed',
    key,
    status: 'completed',
  })

  return new Response(null, { status: 204 })
}

export async function handleDirectDownload(request: Request) {
  if (isMockUploadsEnabled()) {
    return new Response('Not Found', { status: 404 })
  }

  const session = await getSessionFn()
  if (!session?.user?.id || !session.session.activeOrganizationId) {
    return new Response('Unauthorized', { status: 401 })
  }

  const db = getDb()
  let organizationId: string
  try {
    const access = await resolveActiveLocationAccess(db, session)
    if (access.userId !== session.user.id) {
      return new Response('Unauthorized', { status: 401 })
    }
    organizationId = access.organizationId
    assertCommercialProductAccess(access)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unauthorized'
    const status = message === 'Unauthorized' || message === 'No active organization' ? 401 : 403
    return new Response(message, { status })
  }

  const url = new URL(request.url)
  const key = url.searchParams.get('key')?.trim() ?? ''
  if (!key || !isAllowedUploadKey(key, organizationId)) {
    return new Response('Invalid upload key', { status: 400 })
  }

  let capability: ReturnType<typeof verifyDirectDownloadCapability>
  try {
    capability = verifyDirectDownloadCapability(url.searchParams.get('download'))
  } catch {
    capability = null
  }
  if (!capability || capability.organizationId !== organizationId || capability.key !== key) {
    return new Response('Invalid download capability', { status: 403 })
  }

  const object = await getUploadedObject(key)
  if (!object?.body) {
    return new Response('Not Found', { status: 404 })
  }

  const headers = new Headers()
  object.writeHttpMetadata?.(headers)
  if (object.httpMetadata?.contentType && !headers.has('content-type')) {
    headers.set('content-type', object.httpMetadata.contentType)
  }
  if (object.httpMetadata?.contentEncoding && !headers.has('content-encoding')) {
    headers.set('content-encoding', object.httpMetadata.contentEncoding)
  }

  return new Response(object.body, { headers })
}

export const Route = createFileRoute('/api/uploads/direct')({
  server: {
    handlers: {
      GET: async ({ request }) => handleDirectDownload(request),
      PUT: async ({ request }) => handleDirectUpload(request),
    },
  },
})
