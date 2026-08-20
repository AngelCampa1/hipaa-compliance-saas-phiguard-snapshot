import { createHmac } from 'node:crypto'

const SCAN_REQUEST_MISSING_MESSAGE = 'Attachment malware scanning is not configured'

type AttachmentScanRequestInput = {
  organizationId: string
  key: string
  bucket: string
  contentType: string
  sizeBytes: number
}

function getScanRequestUrl() {
  return process.env.ATTACHMENT_SCAN_REQUEST_URL ?? ''
}

function getScanRequestSecret() {
  return process.env.ATTACHMENT_SCAN_REQUEST_SECRET ?? ''
}

function getScanWebhookSecret() {
  return process.env.ATTACHMENT_SCAN_WEBHOOK_SECRET ?? ''
}

function getAppUrl() {
  return process.env.APP_URL ?? 'http://localhost:3000'
}

export function assertAttachmentScanningConfigured() {
  if (!getScanRequestUrl() || !getScanRequestSecret() || !getScanWebhookSecret()) {
    throw new Error(SCAN_REQUEST_MISSING_MESSAGE)
  }
}

function signScanRequest(body: string) {
  return createHmac('sha256', getScanRequestSecret()).update(body).digest('base64url')
}

export async function dispatchAttachmentScanRequest(input: AttachmentScanRequestInput) {
  assertAttachmentScanningConfigured()

  const body = JSON.stringify({
    organizationId: input.organizationId,
    key: input.key,
    bucket: input.bucket,
    contentType: input.contentType,
    sizeBytes: input.sizeBytes,
    callbackUrl: new URL('/api/uploads/scan-result', getAppUrl()).toString(),
    timestamp: new Date().toISOString(),
  })

  const response = await fetch(getScanRequestUrl(), {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-phiguard-scan-request-signature': `sha256=${signScanRequest(body)}`,
    },
    body,
  })

  if (!response.ok) {
    throw new Error('Attachment malware scan request was not accepted')
  }
}
