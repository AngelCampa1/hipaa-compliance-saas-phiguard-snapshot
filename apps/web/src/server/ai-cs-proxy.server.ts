import * as crypto from 'node:crypto'
import { writeAuditEvent } from '@phiguard/audit'
import { aiCsEscalations, getDb } from '@phiguard/db/server'
import { sendAiCsEscalationNotification } from '@phiguard/email'
import { resolveAppSessionFromHeaders } from '../lib/session.server.js'
import { captureServerException } from '../lib/sentry.js'
import {
  createIdentifierRateLimitMiddleware,
  createRateLimitMiddleware,
} from '../middleware/rate-limit.js'
import { assertCommercialProductAccess, resolveActiveLocationAccess } from './access.js'
import {
  AI_CS_APP_ID,
  MAX_AI_CS_CONTACT_LENGTH,
  MAX_AI_CS_ESCALATION_REASON_LENGTH,
  MAX_AI_CS_MESSAGE_LENGTH,
  MAX_AI_CS_PATH_LENGTH,
  MAX_AI_CS_SESSION_ID_LENGTH,
  type AiCsEndpoint,
  isAiCsConfigured,
} from './ai-cs.js'

const MAX_AI_CS_REQUEST_BODY_BYTES = 12_000

const aiCsRequestRateLimit = createRateLimitMiddleware({
  keyPrefix: 'ai-cs-proxy',
  maxTokens: 60,
  refillRate: 60,
  windowMs: 60_000,
})

const aiCsUserRateLimit = createIdentifierRateLimitMiddleware({
  keyPrefix: 'ai-cs-proxy-user',
  maxTokens: 30,
  refillRate: 30,
  windowMs: 60_000,
})

export function stableJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`
  if (value && typeof value === 'object') {
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => (left < right ? -1 : left > right ? 1 : 0))
      .map(([key, entry]) => `${JSON.stringify(key)}:${stableJson(entry)}`)
      .join(',')}}`
  }
  return JSON.stringify(value)
}

export function sha256Hex(value: string): string {
  return crypto.createHash('sha256').update(value).digest('hex')
}

export function hmacHex(payload: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(payload).digest('hex')
}

function readAiCsProxyConfig(env: NodeJS.ProcessEnv = process.env) {
  const secret = env.AI_CS_CLIENT_ASSERTION_SECRET?.trim()
  const workerOrigin = env.AI_CS_WORKER_ORIGIN?.trim().replace(/\/+$/, '')
  if (!secret || !workerOrigin || !isAiCsConfigured(env)) return null
  return { secret, workerOrigin }
}

function readStringField(body: Record<string, unknown>, field: string) {
  const value = body[field]
  return typeof value === 'string' ? value.trim() : undefined
}

function readOptionalBoundedString(
  body: Record<string, unknown>,
  field: string,
  maxLength: number,
) {
  const value = readStringField(body, field)
  if (value === undefined) return undefined
  if (!value || value.length > maxLength) return null
  return value
}

function readRequiredBoundedString(
  body: Record<string, unknown>,
  field: string,
  maxLength: number,
) {
  return readOptionalBoundedString(body, field, maxLength) ?? null
}

function buildWorkerBody(input: {
  endpoint: AiCsEndpoint
  requestBody: Record<string, unknown>
  userId: string
  organizationId: string
}) {
  const currentPath = readOptionalBoundedString(
    input.requestBody,
    'currentPath',
    MAX_AI_CS_PATH_LENGTH,
  )
  if (currentPath === null) return null

  if (input.endpoint === 'sessions') {
    return {
      appId: AI_CS_APP_ID,
      userId: input.userId,
      ...(currentPath ? { currentPath } : {}),
      metadata: { organizationId: input.organizationId },
    }
  }

  const sessionId = readRequiredBoundedString(
    input.requestBody,
    'sessionId',
    MAX_AI_CS_SESSION_ID_LENGTH,
  )
  if (!sessionId) return null

  if (input.endpoint === 'chat') {
    const message = readRequiredBoundedString(
      input.requestBody,
      'message',
      MAX_AI_CS_MESSAGE_LENGTH,
    )
    if (!message) return null

    return {
      appId: AI_CS_APP_ID,
      userId: input.userId,
      sessionId,
      message,
      ...(currentPath ? { currentPath } : {}),
      metadata: { organizationId: input.organizationId },
    }
  }

  const reason = readOptionalBoundedString(
    input.requestBody,
    'reason',
    MAX_AI_CS_ESCALATION_REASON_LENGTH,
  )
  if (reason === null) return null

  return {
    appId: AI_CS_APP_ID,
    userId: input.userId,
    sessionId,
    ...(reason ? { reason } : {}),
    ...(currentPath ? { currentPath } : {}),
    metadata: { organizationId: input.organizationId },
  }
}

function signedHeaders(input: {
  body: Record<string, unknown>
  path: string
  secret: string
  origin?: string
}) {
  const timestamp = new Date().toISOString()
  const nonce = crypto.randomUUID().replaceAll('-', '')
  const bodyHash = sha256Hex(stableJson(input.body))
  const signaturePayload = `${timestamp}.${nonce}.POST.${input.path}.${bodyHash}`

  return {
    'Content-Type': 'application/json',
    'X-Ventora-Timestamp': timestamp,
    'X-Ventora-Nonce': nonce,
    'X-Ventora-Signature': hmacHex(signaturePayload, input.secret),
    ...(input.origin ? { Origin: input.origin } : {}),
  }
}

interface RecordAiCsEscalationInput {
  organizationId: string
  userId: string
  sessionId: string
  reason?: string | null
  message?: string | null
  contact?: string | null
  currentPath?: string | null
}

async function recordAiCsEscalation(input: RecordAiCsEscalationInput): Promise<void> {
  const db = getDb()
  await db.transaction(async (tx) => {
    const [inserted] = await tx
      .insert(aiCsEscalations)
      .values({
        tenantId: input.organizationId,
        userId: input.userId,
        sessionId: input.sessionId,
        appId: AI_CS_APP_ID,
        reason: input.reason ?? null,
        message: input.message ?? null,
        contact: input.contact ?? null,
        currentPath: input.currentPath ?? null,
      })
      .returning({ id: aiCsEscalations.id })

    // HIPAA: every write to a PHI table must leave an audit trail in the same
    // transaction. Record only non-PHI metadata - never the free-text reason,
    // message, or contact values, which a user could fill with patient info.
    await writeAuditEvent(tx, {
      tenantId: input.organizationId,
      actorId: input.userId,
      action: 'ai_cs.escalation.created',
      resourceType: 'ai_cs_escalation',
      resourceId: inserted?.id ?? input.sessionId,
      after: {
        appId: AI_CS_APP_ID,
        sessionId: input.sessionId,
        hasReason: input.reason != null,
        hasMessage: input.message != null,
        hasContact: input.contact != null,
      },
    })
  })
}

function buildProxyResponseHeaders(workerHeaders: Headers) {
  const headers = new Headers()
  const contentType = workerHeaders.get('Content-Type')
  const cacheControl = workerHeaders.get('Cache-Control')

  if (contentType) {
    headers.set('Content-Type', contentType)
  }
  if (cacheControl) {
    headers.set('Cache-Control', cacheControl)
  }

  return headers
}

async function readBoundedJsonBody(request: Request) {
  const body = await request.arrayBuffer()
  if (body.byteLength > MAX_AI_CS_REQUEST_BODY_BYTES) {
    return { status: 'too_large' as const }
  }

  try {
    const text = new TextDecoder().decode(body)
    const parsed = text ? JSON.parse(text) : {}
    const value =
      parsed && typeof parsed === 'object' && !Array.isArray(parsed)
        ? (parsed as Record<string, unknown>)
        : {}

    return { status: 'ok' as const, value }
  } catch {
    return { status: 'invalid_json' as const }
  }
}

export async function handleAiCsProxyRequest(request: Request, endpoint: AiCsEndpoint) {
  const config = readAiCsProxyConfig()
  if (!config) {
    return new Response('AI-CS is not configured', { status: 503 })
  }

  const requestLimited = await aiCsRequestRateLimit(request)
  if (requestLimited) {
    return requestLimited
  }

  const session = await resolveAppSessionFromHeaders(request.headers)
  const userId = session?.user?.id
  const sessionOrganizationId = session?.session?.activeOrganizationId
  if (!userId || !sessionOrganizationId) {
    return new Response('Unauthorized', { status: 401 })
  }

  const userLimited = await aiCsUserRateLimit(userId)
  if (userLimited) {
    return userLimited
  }

  let organizationId: string
  try {
    const access = await resolveActiveLocationAccess(getDb(), session)
    if (access.userId !== userId) {
      return new Response('Unauthorized', { status: 401 })
    }
    organizationId = access.organizationId
    assertCommercialProductAccess(access)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unauthorized'
    const status = message === 'Unauthorized' || message === 'No active organization' ? 401 : 403
    return new Response(message, { status })
  }

  const parsedBody = await readBoundedJsonBody(request)
  if (parsedBody.status === 'too_large') {
    return new Response('AI-CS payload too large', { status: 413 })
  }
  if (parsedBody.status === 'invalid_json') {
    return new Response('Invalid JSON payload', { status: 400 })
  }
  const requestBody = parsedBody.value

  const workerBody = buildWorkerBody({
    endpoint,
    requestBody,
    userId,
    organizationId,
  })
  if (!workerBody) {
    return new Response('Invalid AI-CS payload', { status: 400 })
  }

  if (endpoint === 'escalations') {
    const message = readOptionalBoundedString(requestBody, 'message', MAX_AI_CS_MESSAGE_LENGTH)
    const contact = readOptionalBoundedString(requestBody, 'contact', MAX_AI_CS_CONTACT_LENGTH)
    const escalationCurrentPath = readOptionalBoundedString(requestBody, 'currentPath', MAX_AI_CS_PATH_LENGTH)
    const escalationReason = readOptionalBoundedString(
      requestBody,
      'reason',
      MAX_AI_CS_ESCALATION_REASON_LENGTH,
    )
    const sessionId = readRequiredBoundedString(requestBody, 'sessionId', MAX_AI_CS_SESSION_ID_LENGTH)

    if (sessionId) {
      const escalationInput: RecordAiCsEscalationInput = {
        organizationId,
        userId,
        sessionId,
        reason: escalationReason,
        message: message === null ? undefined : message,
        contact: contact === null ? undefined : contact,
        currentPath: escalationCurrentPath === null ? undefined : escalationCurrentPath,
      }

      try {
        await recordAiCsEscalation(escalationInput)
      } catch (e) {
        captureServerException(e, { operation: 'ai-cs-escalation-persist' })
      }

      try {
        await sendAiCsEscalationNotification({
          appId: AI_CS_APP_ID,
          organizationId,
          userId,
          sessionId,
          reason: escalationInput.reason,
          message: escalationInput.message,
          contact: escalationInput.contact,
          currentPath: escalationInput.currentPath,
        })
      } catch (e) {
        captureServerException(e, { operation: 'ai-cs-escalation-email' })
      }
    }
  }

  const origin =
    request.headers.get('Origin') ??
    process.env.AI_CS_APP_ORIGIN?.trim() ??
    process.env.APP_URL?.trim() ??
    undefined

  const path = `/v1/${endpoint}`
  let workerResponse: Response
  try {
    workerResponse = await fetch(`${config.workerOrigin}${path}`, {
      method: 'POST',
      headers: signedHeaders({
        body: workerBody,
        path,
        secret: config.secret,
        origin,
      }),
      body: JSON.stringify(workerBody),
    })
  } catch {
    return new Response('AI-CS worker request failed', { status: 502 })
  }

  return new Response(workerResponse.body, {
    status: workerResponse.status,
    statusText: workerResponse.statusText,
    headers: buildProxyResponseHeaders(workerResponse.headers),
  })
}
