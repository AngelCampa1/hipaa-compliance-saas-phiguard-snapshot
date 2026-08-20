import * as crypto from 'node:crypto'
import { aiCsNonces, getDb } from '@phiguard/db/server'
import { HELP_TOPICS, ROUTE_HELP } from '@phiguard/knowledge'
import { AI_CS_APP_ID } from './ai-cs.js'
import { hmacHex, sha256Hex, stableJson } from './ai-cs-proxy.server.js'

// ---------------------------------------------------------------------------
// Local type definitions matching @ventora/ai-cs-contracts AiCsAppContext
// ---------------------------------------------------------------------------

type AiAssistantContextSource = {
  id: string
  title: string
  url: string
  excerpt?: string
}

type AiCsNavigationTarget = {
  label: string
  path: string
  description?: string
}

type AiCsWorkflowStep = {
  id: string
  label: string
  status: 'completed' | 'current' | 'next'
  path?: string
}

type AiCsAppContext = {
  assistantId: 'ai-cs'
  appId: string
  appName: string
  authenticatedOnly: true
  description?: string
  currentPath?: string
  sources?: AiAssistantContextSource[]
  navigation?: AiCsNavigationTarget[]
  workflow?: AiCsWorkflowStep[]
}

const APP_NAME = 'PHIGuard'
const APP_BASE_URL = 'https://my.phiguard.app'
const MAX_SKEW_MS = 5 * 60 * 1000
const MAX_SOURCES = 8
const MAX_NAVIGATION = 12

type HmacHeaders = {
  timestamp: string
  nonce: string
  signature: string
}

function readHmacHeaders(headers: Headers): HmacHeaders | null {
  const timestamp = headers.get('X-Ventora-Timestamp')
  const nonce = headers.get('X-Ventora-Nonce')
  const signature = headers.get('X-Ventora-Signature')
  return timestamp && nonce && signature ? { timestamp, nonce, signature } : null
}

function buildCanonicalPayload(input: {
  timestamp: string
  nonce: string
  method: string
  path: string
  body: Record<string, unknown>
}): string {
  const bodyHash = sha256Hex(stableJson(input.body))
  return `${input.timestamp}.${input.nonce}.${input.method.toUpperCase()}.${input.path}.${bodyHash}`
}

function verifySignature(payload: string, signature: string, secret: string): boolean {
  if (!/^[a-f0-9]{64}$/.test(signature)) return false
  const expected = hmacHex(payload, secret)
  // Constant-time comparison
  if (expected.length !== signature.length) return false
  let diff = 0
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ signature.charCodeAt(i)
  }
  return diff === 0
}

function checkTimestampSkew(timestamp: string, nowMs: number = Date.now()): boolean {
  const ts = Date.parse(timestamp)
  return Number.isFinite(ts) && Math.abs(nowMs - ts) <= MAX_SKEW_MS
}

/**
 * Consume a nonce exactly once. Returns true on first use, false on replay,
 * throws on DB error (fail closed — this is a security control).
 */
export async function consumeNonce(
  nonce: string,
  timestamp: string,
  nowMs: number = Date.now(),
): Promise<boolean> {
  const timestampMs = Date.parse(timestamp)
  const expiresAt = new Date(timestampMs + MAX_SKEW_MS)

  void nowMs // available for callers/tests to inject; actual expiry is timestamp-based

  const db = getDb()
  const rows = await db
    .insert(aiCsNonces)
    .values({ nonce, expiresAt })
    .onConflictDoNothing({ target: aiCsNonces.nonce })
    .returning()

  return rows.length > 0
}

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function buildSources(): AiAssistantContextSource[] {
  return HELP_TOPICS.slice(0, MAX_SOURCES).map((topic) => ({
    id: topic.id,
    title: topic.title,
    url: `${APP_BASE_URL}/app/help?topic=${topic.id}`,
    excerpt: topic.summary,
  }))
}

function buildNavigation(): AiCsNavigationTarget[] {
  return Object.entries(ROUTE_HELP)
    .filter(([route]) => !route.startsWith('/app/admin') && route !== '/app/soc2')
    .slice(0, MAX_NAVIGATION)
    .map(([route, help]) => ({
      label: help.title,
      path: route,
      description: help.summary,
    }))
}

function buildWorkflow(): AiCsWorkflowStep[] {
  // Use firstRun steps from appPublicGuidanceCopy via knowledge-level HELP_TOPICS
  // The onboarding steps are embedded in the getting-started help topic's relatedLinks
  const gettingStarted = HELP_TOPICS.find((t) => t.id === 'first-day')
  if (!gettingStarted) return []
  return gettingStarted.relatedLinks.map((link) => ({
    id: slugify(link.label),
    label: link.label,
    status: 'next' as const,
    path: link.to,
  }))
}

export function buildPhiguardAppContext(): AiCsAppContext {
  return {
    assistantId: 'ai-cs',
    appId: AI_CS_APP_ID,
    appName: APP_NAME,
    authenticatedOnly: true,
    description:
      'Authenticated in-app support for PHIGuard, the HIPAA operations hub for small clinics and growing healthcare organizations. Helps clinic administrators, practice owners, and compliance leads with tasks, checklists, policies, training, risk assessments, vendor BAAs, billing, and the audit log.',
    sources: buildSources(),
    navigation: buildNavigation(),
    workflow: buildWorkflow(),
  }
}

export async function handleAiCsContextRequest(request: Request): Promise<Response> {
  const secret = process.env.AI_CS_CONTEXT_SECRET?.trim()
  if (!secret) {
    return Response.json({ error: 'App context unavailable' }, { status: 503 })
  }

  const url = new URL(request.url)
  const appId = url.searchParams.get('appId')
  const userId = url.searchParams.get('userId')

  if (!appId || !userId) {
    return Response.json({ error: 'Missing required parameters' }, { status: 400 })
  }

  if (appId !== AI_CS_APP_ID) {
    return Response.json({ error: 'Unknown app' }, { status: 400 })
  }

  const hmacHeaders = readHmacHeaders(request.headers)
  if (!hmacHeaders) {
    return Response.json({ error: 'Missing signature' }, { status: 401 })
  }

  const path = `${url.pathname}${url.search}`
  const canonicalPayload = buildCanonicalPayload({
    timestamp: hmacHeaders.timestamp,
    nonce: hmacHeaders.nonce,
    method: 'GET',
    path,
    body: { appId, userId },
  })

  if (!checkTimestampSkew(hmacHeaders.timestamp)) {
    return Response.json({ error: 'Invalid signature' }, { status: 401 })
  }

  if (!verifySignature(canonicalPayload, hmacHeaders.signature, secret)) {
    return Response.json({ error: 'Invalid signature' }, { status: 401 })
  }

  let nonceAccepted: boolean
  try {
    nonceAccepted = await consumeNonce(hmacHeaders.nonce, hmacHeaders.timestamp)
  } catch {
    return Response.json({ error: 'App context unavailable' }, { status: 503 })
  }

  if (!nonceAccepted) {
    return Response.json({ error: 'Invalid signature' }, { status: 401 })
  }

  const body = buildPhiguardAppContext()
  const responseTimestamp = new Date().toISOString()
  const responseNonce = crypto.randomUUID()
  const responsePayload = buildCanonicalPayload({
    timestamp: responseTimestamp,
    nonce: responseNonce,
    method: 'GET',
    path,
    body: body as unknown as Record<string, unknown>,
  })
  const responseSignature = hmacHex(responsePayload, secret)

  return Response.json(body, {
    status: 200,
    headers: {
      'Cache-Control': 'private, max-age=300',
      'X-Ventora-Timestamp': responseTimestamp,
      'X-Ventora-Nonce': responseNonce,
      'X-Ventora-Signature': responseSignature,
    },
  })
}
