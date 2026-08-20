import { createHmac } from 'node:crypto'
import {
  getAttachmentsBucketBinding,
  getAttachmentsBucketName,
  getLeadMagnetsBucketBinding,
  type ObjectStorageObject,
} from '@phiguard/audit'
import { getLeadMagnetBySlug, isLeadMagnetSlug } from '@phiguard/lead-magnets'

function timingSafeCompare(a: Buffer, b: Buffer): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= (a[i] as number) ^ (b[i] as number)
  return diff === 0
}

export const ALLOWED_UPLOAD_CONTENT_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'text/csv',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
])

export const MAX_UPLOAD_BYTES = 25 * 1024 * 1024 // 25 MB
export const ATTACHMENTS_BUCKET_MISSING_MESSAGE = 'Attachment storage is not configured'
export const UPLOAD_OBJECT_ALREADY_EXISTS_MESSAGE = 'Upload capability has already been used'
export const CREATE_ONLY_UPLOAD_HEADERS = {
  'If-None-Match': '*',
} as const

export function isMockUploadsEnabled() {
  return process.env.ENABLE_MOCK_UPLOADS === 'true' && process.env.PLAYWRIGHT === 'true'
}

export function buildMockUploadUrl(key: string) {
  return `/api/uploads/mock?key=${encodeURIComponent(key)}`
}

export type DirectUploadCapability = {
  organizationId: string
  key: string
  contentType: string
  maxBytes: number
  expiresAt: number
}

export type DirectDownloadCapability = {
  organizationId: string
  key: string
  expiresAt: number
}

function getDirectUploadSecret() {
  const secret = process.env.DIRECT_UPLOAD_SECRET
  if (secret) {
    return secret
  }

  if (process.env.NODE_ENV === 'production') {
    return ''
  }

  return process.env.BETTER_AUTH_SECRET ?? ''
}

function encodeBase64Url(value: string) {
  return Buffer.from(value).toString('base64url')
}

function signDirectUploadPayload(payload: string) {
  const secret = getDirectUploadSecret()
  if (!secret) {
    throw new Error('DIRECT_UPLOAD_SECRET is required for direct uploads')
  }

  return createHmac('sha256', secret).update(payload).digest('base64url')
}

function verifyDirectUploadSignature(payload: string, signature: string) {
  const secret = getDirectUploadSecret()
  if (!secret) {
    return false
  }

  const expected = createHmac('sha256', secret).update(payload).digest('base64url')
  return timingSafeCompare(Buffer.from(signature), Buffer.from(expected))
}

export function createDirectUploadCapability(input: {
  organizationId: string
  key: string
  contentType: string
  maxBytes?: number
  expiresIn?: number
}) {
  const capability: DirectUploadCapability = {
    organizationId: input.organizationId,
    key: input.key,
    contentType: input.contentType,
    maxBytes: input.maxBytes ?? MAX_UPLOAD_BYTES,
    expiresAt: Math.floor(Date.now() / 1000) + (input.expiresIn ?? 300),
  }
  const payload = encodeBase64Url(JSON.stringify(capability))
  const signature = signDirectUploadPayload(payload)

  return `${payload}.${signature}`
}

export function createDirectDownloadCapability(input: {
  organizationId: string
  key: string
  expiresIn?: number
}) {
  const capability: DirectDownloadCapability = {
    organizationId: input.organizationId,
    key: input.key,
    expiresAt: Math.floor(Date.now() / 1000) + (input.expiresIn ?? 900),
  }
  const payload = encodeBase64Url(JSON.stringify(capability))
  const signature = signDirectUploadPayload(payload)

  return `${payload}.${signature}`
}

export function verifyDirectUploadCapability(token: string | null): DirectUploadCapability | null {
  if (!token) return null

  const parts = token.split('.')
  if (parts.length !== 2) return null

  const [payload, signature] = parts
  if (!payload || !signature) return null

  if (!verifyDirectUploadSignature(payload, signature)) {
    return null
  }

  try {
    const capability = JSON.parse(
      Buffer.from(payload, 'base64url').toString('utf8'),
    ) as DirectUploadCapability
    if (
      !capability.organizationId ||
      !capability.key ||
      !capability.contentType ||
      !Number.isInteger(capability.maxBytes) ||
      capability.maxBytes <= 0 ||
      !Number.isInteger(capability.expiresAt) ||
      capability.expiresAt < Math.floor(Date.now() / 1000)
    ) {
      return null
    }

    return capability
  } catch {
    return null
  }
}

export function verifyDirectDownloadCapability(token: string | null): DirectDownloadCapability | null {
  if (!token) return null

  const parts = token.split('.')
  if (parts.length !== 2) return null

  const [payload, signature] = parts
  if (!payload || !signature) return null

  if (!verifyDirectUploadSignature(payload, signature)) {
    return null
  }

  try {
    const capability = JSON.parse(
      Buffer.from(payload, 'base64url').toString('utf8'),
    ) as DirectDownloadCapability
    if (
      !capability.organizationId ||
      !capability.key ||
      !Number.isInteger(capability.expiresAt) ||
      capability.expiresAt < Math.floor(Date.now() / 1000)
    ) {
      return null
    }

    return capability
  } catch {
    return null
  }
}

export function buildDirectUploadUrl(key: string, token: string) {
  return `/api/uploads/direct?key=${encodeURIComponent(key)}&token=${encodeURIComponent(token)}`
}

export function buildDirectDownloadUrl(key: string, token: string) {
  return `/api/uploads/direct?key=${encodeURIComponent(key)}&download=${encodeURIComponent(token)}`
}

export function requireAttachmentsBucketName() {
  const bucket = getAttachmentsBucketName()

  if (!bucket) {
    throw new Error(ATTACHMENTS_BUCKET_MISSING_MESSAGE)
  }

  return bucket
}

export function getEffectiveAttachmentsBucketName() {
  return getAttachmentsBucketName() || (isMockUploadsEnabled() ? 'mock-bucket' : null)
}

function getAppOrigin() {
  return process.env.APP_URL ?? 'http://localhost:3000'
}

export async function generatePresignedUploadUrl(input: {
  bucket: string
  key: string
  organizationId?: string
  contentType: string
  sizeBytes?: number
  expiresIn?: number
}): Promise<string> {
  if (!getAttachmentsBucketBinding()) {
    throw new Error(ATTACHMENTS_BUCKET_MISSING_MESSAGE)
  }

  if (!input.organizationId) {
    throw new Error('organizationId is required for direct uploads')
  }

  const token = createDirectUploadCapability({
    organizationId: input.organizationId,
    key: input.key,
    contentType: input.contentType,
    maxBytes: input.sizeBytes,
    expiresIn: input.expiresIn,
  })

  return buildDirectUploadUrl(input.key, token)
}

export async function generatePresignedDownloadUrl(input: {
  bucket: string
  key: string
  organizationId?: string
  expiresIn?: number
}): Promise<string> {
  if (!getAttachmentsBucketBinding()) {
    throw new Error(ATTACHMENTS_BUCKET_MISSING_MESSAGE)
  }

  const organizationId = input.organizationId ?? input.key.split('/')[1]
  if (!organizationId) {
    throw new Error('organizationId is required for direct downloads')
  }

  const token = createDirectDownloadCapability({
    organizationId,
    key: input.key,
    expiresIn: input.expiresIn,
  })

  return buildDirectDownloadUrl(input.key, token)
}

export async function assertUploadedObject(input: {
  bucket: string
  key: string
  contentType: string
  sizeBytes: number
}) {
  const binding = getAttachmentsBucketBinding()
  if (!binding) {
    throw new Error(ATTACHMENTS_BUCKET_MISSING_MESSAGE)
  }

  const object = await binding.head(input.key)
  if (!object) {
    throw new Error('Uploaded object was not found in attachment storage')
  }

  if (typeof object.size === 'number' && object.size !== input.sizeBytes) {
    throw new Error('Uploaded object size does not match the expected attachment size')
  }

  if (object.httpMetadata?.contentType && object.httpMetadata.contentType !== input.contentType) {
    throw new Error('Uploaded object content type does not match the expected attachment type')
  }
}

export async function assertObjectExists(input: {
  bucket: string
  key: string
  maxBytes?: number
}): Promise<{ contentType: string; sizeBytes: number }> {
  const binding = getAttachmentsBucketBinding()
  if (!binding) {
    throw new Error(ATTACHMENTS_BUCKET_MISSING_MESSAGE)
  }

  const object = await binding.head(input.key)
  if (!object) {
    throw new Error('Uploaded object was not found in attachment storage')
  }
  if (
    typeof input.maxBytes === 'number' &&
    typeof object.size === 'number' &&
    object.size > input.maxBytes
  ) {
    throw new Error('Uploaded object exceeds the maximum attachment size')
  }
  return {
    contentType: object.httpMetadata?.contentType ?? 'application/octet-stream',
    sizeBytes: typeof object.size === 'number' ? object.size : 0,
  }
}

export async function putUploadedObject(input: {
  key: string
  body: ReadableStream | Uint8Array | Buffer | string
  contentType?: string | null
  rejectIfExists?: boolean
}) {
  const binding = getAttachmentsBucketBinding()
  if (!binding) {
    throw new Error(ATTACHMENTS_BUCKET_MISSING_MESSAGE)
  }

  const result = await binding.put(input.key, input.body, {
    httpMetadata: {
      contentType: input.contentType ?? 'application/octet-stream',
    },
    onlyIf: input.rejectIfExists ? { etagDoesNotMatch: '*' } : undefined,
  })
  if (input.rejectIfExists && result === null) {
    throw new Error(UPLOAD_OBJECT_ALREADY_EXISTS_MESSAGE)
  }
}

export async function getUploadedObject(key: string): Promise<ObjectStorageObject | null> {
  const binding = getAttachmentsBucketBinding()
  if (!binding) {
    throw new Error(ATTACHMENTS_BUCKET_MISSING_MESSAGE)
  }

  return binding.get(key)
}

export function sanitizeObjectKeyFilename(filename: string): string {
  return filename.replace(/[^a-zA-Z0-9.\-_]/g, '_')
}

function buildNamespacedObjectKey(
  namespace: string,
  tenantId: string,
  pathSegments: string[],
  filename: string,
): string {
  const safe = sanitizeObjectKeyFilename(filename)
  return [namespace, tenantId, ...pathSegments, `${Date.now()}_${safe}`].join('/')
}

export function buildAttachmentKey(tenantId: string, taskId: string, filename: string): string {
  return buildNamespacedObjectKey('attachments', tenantId, [taskId], filename)
}

export function buildChecklistEvidenceKey(
  tenantId: string,
  itemId: string,
  filename: string,
): string {
  return buildNamespacedObjectKey('evidence', tenantId, ['checklist-items', itemId], filename)
}

export function buildSoc2EvidenceKey(tenantId: string, filename: string): string {
  return buildNamespacedObjectKey('evidence', tenantId, ['soc2'], filename)
}

export function buildVendorBaaEvidenceKey(
  tenantId: string,
  vendorId: string,
  filename: string,
): string {
  return buildNamespacedObjectKey('evidence', tenantId, ['vendor-baas', vendorId], filename)
}

export function buildTrainingCertificateKey(
  tenantId: string,
  recordId: string,
  filename: string,
): string {
  return buildNamespacedObjectKey(
    'evidence',
    tenantId,
    ['training-certificates', recordId],
    filename,
  )
}

export function buildLeadMagnetKey(slug: string): string {
  if (isLeadMagnetSlug(slug)) {
    return getLeadMagnetBySlug(slug).storageKey
  }

  return `lead-magnets/${slug}.pdf`
}

export function buildLeadMagnetDownloadUrl(slug: string) {
  return `${getAppOrigin()}/api/marketing/lead-magnets/${encodeURIComponent(slug)}`
}

export function buildSoc2BundleDownloadUrl(key: string) {
  return `${getAppOrigin()}/api/soc2/bundles?key=${encodeURIComponent(key)}`
}

function isTransientObjectStorageError(error: unknown) {
  if (!(error instanceof Error)) {
    return false
  }

  return error.message.includes('(10001)') && error.message.includes('internal error')
}

async function readLeadMagnetObjectStorage(
  method: 'get' | 'head',
  key: string,
): Promise<ObjectStorageObject | null> {
  const binding = getLeadMagnetsBucketBinding()
  if (!binding) {
    return null
  }

  let lastError: unknown
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      return await binding[method](key)
    } catch (error) {
      lastError = error
      if (!isTransientObjectStorageError(error) || attempt === 3) {
        throw error
      }
    }
  }

  throw lastError
}

export async function getLeadMagnetObject(key: string): Promise<ObjectStorageObject | null> {
  return readLeadMagnetObjectStorage('get', key)
}

export async function getLeadMagnetHead(key: string): Promise<ObjectStorageObject | null> {
  return readLeadMagnetObjectStorage('head', key)
}
