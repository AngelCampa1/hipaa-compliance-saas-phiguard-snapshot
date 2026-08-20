import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { dispatchAttachmentScanRequest } from './attachment-scan.js'

describe('attachment scan dispatch', () => {
  const originalEnv = { ...process.env }
  const fetchMock = vi.fn()

  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock)
    process.env.ATTACHMENT_SCAN_REQUEST_URL = 'https://scanner.example/scan'
    process.env.ATTACHMENT_SCAN_REQUEST_SECRET = 'request-secret'
    process.env.ATTACHMENT_SCAN_WEBHOOK_SECRET = 'webhook-secret'
    process.env.APP_URL = 'https://my.phiguard.app'
    fetchMock.mockResolvedValue(new Response(null, { status: 202 }))
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    process.env = { ...originalEnv }
    vi.clearAllMocks()
  })

  it('sends a signed scan request with the attachment object reference and callback URL', async () => {
    await dispatchAttachmentScanRequest({
      organizationId: 'org-1',
      key: 'attachments/org-1/task-1/evidence.txt',
      bucket: 'attachments-bucket',
      contentType: 'text/plain',
      sizeBytes: 128,
    })

    expect(fetchMock).toHaveBeenCalledOnce()
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('https://scanner.example/scan')
    expect(init.method).toBe('POST')
    expect(init.headers).toMatchObject({
      'content-type': 'application/json',
    })
    expect(
      (init.headers as Record<string, string>)['x-phiguard-scan-request-signature'],
    ).toMatch(/^sha256=/)

    const payload = JSON.parse(init.body as string) as Record<string, unknown>
    expect(payload).toMatchObject({
      organizationId: 'org-1',
      key: 'attachments/org-1/task-1/evidence.txt',
      bucket: 'attachments-bucket',
      contentType: 'text/plain',
      sizeBytes: 128,
      callbackUrl: 'https://my.phiguard.app/api/uploads/scan-result',
    })
    expect(typeof payload.timestamp).toBe('string')
  })

  it('fails closed when scanner configuration is incomplete', async () => {
    delete process.env.ATTACHMENT_SCAN_REQUEST_URL

    await expect(
      dispatchAttachmentScanRequest({
        organizationId: 'org-1',
        key: 'attachments/org-1/task-1/evidence.txt',
        bucket: 'attachments-bucket',
        contentType: 'text/plain',
        sizeBytes: 128,
      }),
    ).rejects.toThrow('Attachment malware scanning is not configured')

    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('rejects when the scanner does not accept the request', async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 500 }))

    await expect(
      dispatchAttachmentScanRequest({
        organizationId: 'org-1',
        key: 'attachments/org-1/task-1/evidence.txt',
        bucket: 'attachments-bucket',
        contentType: 'text/plain',
        sizeBytes: 128,
      }),
    ).rejects.toThrow('Attachment malware scan request was not accepted')
  })
})
