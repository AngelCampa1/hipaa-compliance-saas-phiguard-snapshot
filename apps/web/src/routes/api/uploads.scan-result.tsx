import { createHmac } from 'node:crypto'
import { createFileRoute } from '@tanstack/react-router'
import { getDb } from '@phiguard/db/server'
import { updateTaskAttachmentScanResult } from '@phiguard/db/tasks'
import { z } from 'zod'
import { updateEvidenceFileScanResult } from '../../lib/evidence-file-scan.js'
import { getUploadKeyTarget } from '../../lib/upload-keys.js'

const AttachmentScanResultInput = z.object({
  organizationId: z.string().min(1),
  key: z.string().min(1),
  status: z.enum(['clean', 'infected']),
  timestamp: z.string().datetime(),
})

const SCAN_RESULT_REPLAY_WINDOW_MS = 10 * 60 * 1000
const MAX_SCAN_RESULT_BODY_BYTES = 4096

function timingSafeCompare(a: Buffer, b: Buffer): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= (a[i] as number) ^ (b[i] as number)
  return diff === 0
}

function getAttachmentScanWebhookSecret() {
  return process.env.ATTACHMENT_SCAN_WEBHOOK_SECRET ?? ''
}

function verifyAttachmentScanSignature(body: string, signatureHeader: string | null) {
  const secret = getAttachmentScanWebhookSecret()
  if (!secret || !signatureHeader?.startsWith('sha256=')) {
    return false
  }

  const signature = signatureHeader.slice('sha256='.length)
  const expected = createHmac('sha256', secret).update(body).digest('base64url')
  return timingSafeCompare(Buffer.from(signature), Buffer.from(expected))
}

function isFreshScanResultTimestamp(timestamp: string) {
  const receivedAt = new Date(timestamp).getTime()
  if (Number.isNaN(receivedAt)) return false

  return Math.abs(Date.now() - receivedAt) <= SCAN_RESULT_REPLAY_WINDOW_MS
}

async function readBoundedTextBody(request: Request, maxBytes: number) {
  const contentLength = Number(request.headers.get('content-length') ?? 0)
  if (Number.isFinite(contentLength) && contentLength > maxBytes) {
    return null
  }

  if (!request.body) {
    return ''
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

  return new TextDecoder().decode(body)
}

export async function handleAttachmentScanResult(request: Request) {
  const body = await readBoundedTextBody(request, MAX_SCAN_RESULT_BODY_BYTES)
  if (body === null) {
    return new Response('Scan result payload too large', { status: 413 })
  }

  if (!verifyAttachmentScanSignature(body, request.headers.get('x-phiguard-scan-signature'))) {
    return new Response('Invalid scan signature', { status: 401 })
  }

  let payload: unknown
  try {
    payload = JSON.parse(body)
  } catch {
    return new Response('Invalid scan result', { status: 400 })
  }

  const parsed = AttachmentScanResultInput.safeParse(payload)
  if (!parsed.success) {
    return new Response('Invalid scan result', { status: 400 })
  }

  const data = parsed.data
  if (!isFreshScanResultTimestamp(data.timestamp)) {
    return new Response('Invalid scan signature', { status: 401 })
  }

  const scanTarget = getUploadKeyTarget(data.key, data.organizationId)
  if (!scanTarget) {
    return new Response('Invalid attachment key', { status: 400 })
  }

  const db = getDb()
  const scan =
    scanTarget === 'taskAttachment'
      ? await updateTaskAttachmentScanResult(db, {
          tenantId: data.organizationId,
          s3Key: data.key,
          avStatus: data.status,
        })
      : await updateEvidenceFileScanResult(db, {
          tenantId: data.organizationId,
          s3Key: data.key,
          avStatus: data.status,
        })

  if (!scan) {
    return new Response('Attachment not found', { status: 404 })
  }

  return Response.json({
    attachmentId: scan.id,
    status: scan.avStatus,
  })
}

export const Route = createFileRoute('/api/uploads/scan-result')({
  server: {
    handlers: {
      POST: async ({ request }) => handleAttachmentScanResult(request),
    },
  },
})
