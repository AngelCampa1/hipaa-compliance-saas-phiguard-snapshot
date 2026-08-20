import { createHmac } from 'node:crypto'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { handleAttachmentScanResult } from './uploads.scan-result'

const { getDbMock, updateEvidenceFileScanResultMock, updateTaskAttachmentScanResultMock } =
  vi.hoisted(() => ({
    getDbMock: vi.fn(),
    updateEvidenceFileScanResultMock: vi.fn(),
    updateTaskAttachmentScanResultMock: vi.fn(),
  }))

vi.mock('@phiguard/db/server', () => ({
  getDb: getDbMock,
}))

vi.mock('@phiguard/db/tasks', () => ({
  updateTaskAttachmentScanResult: updateTaskAttachmentScanResultMock,
}))

vi.mock('../../lib/evidence-file-scan.js', () => ({
  updateEvidenceFileScanResult: updateEvidenceFileScanResultMock,
}))

function signBody(body: string, secret = 'test-scan-secret') {
  return `sha256=${createHmac('sha256', secret).update(body).digest('base64url')}`
}

function requestFor(input: unknown, signature?: string) {
  const body = JSON.stringify(input)
  return new Request('https://my.phiguard.app/api/uploads/scan-result', {
    method: 'POST',
    body,
    headers: {
      'content-type': 'application/json',
      ...(signature ? { 'x-phiguard-scan-signature': signature } : {}),
    },
  })
}

function oversizedPayload() {
  return {
    organizationId: 'org-1',
    key: 'attachments/org-1/task-1/evidence.txt',
    status: 'clean',
    timestamp: '2026-05-01T09:00:00.000Z',
    ignored: 'x'.repeat(5000),
  }
}

describe('attachment scan result route', () => {
  const db = { tag: 'db' }

  beforeEach(() => {
    vi.clearAllMocks()
    process.env.ATTACHMENT_SCAN_WEBHOOK_SECRET = 'test-scan-secret'
    getDbMock.mockReturnValue(db)
    updateTaskAttachmentScanResultMock.mockResolvedValue({
      id: 'attachment-1',
      avStatus: 'clean',
    })
    updateEvidenceFileScanResultMock.mockResolvedValue(null)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('rejects signed scan results outside the replay window', async () => {
    const payload = {
      organizationId: 'org-1',
      key: 'attachments/org-1/task-1/evidence.txt',
      status: 'clean',
      timestamp: '2026-05-01T09:00:00.000Z',
    }
    vi.setSystemTime(new Date('2026-05-01T09:11:00.000Z'))

    const response = await handleAttachmentScanResult(
      requestFor(payload, signBody(JSON.stringify(payload))),
    )

    expect(response.status).toBe(401)
    expect(await response.text()).toBe('Invalid scan signature')
    expect(updateTaskAttachmentScanResultMock).not.toHaveBeenCalled()
  })

  it('returns a controlled 400 for signed malformed JSON', async () => {
    const body = 'not-json'
    const response = await handleAttachmentScanResult(
      new Request('https://my.phiguard.app/api/uploads/scan-result', {
        method: 'POST',
        body,
        headers: {
          'content-type': 'application/json',
          'x-phiguard-scan-signature': signBody(body),
        },
      }),
    )

    expect(response.status).toBe(400)
    expect(await response.text()).toBe('Invalid scan result')
    expect(updateTaskAttachmentScanResultMock).not.toHaveBeenCalled()
  })

  it('rejects oversized scan-result bodies before signature verification', async () => {
    const body = JSON.stringify(oversizedPayload())

    const response = await handleAttachmentScanResult(
      new Request('https://my.phiguard.app/api/uploads/scan-result', {
        method: 'POST',
        body,
        headers: {
          'content-type': 'application/json',
          'content-length': String(body.length),
          'x-phiguard-scan-signature': signBody(body),
        },
      }),
    )

    expect(response.status).toBe(413)
    expect(await response.text()).toBe('Scan result payload too large')
    expect(updateTaskAttachmentScanResultMock).not.toHaveBeenCalled()
    expect(updateEvidenceFileScanResultMock).not.toHaveBeenCalled()
  })

  it('rejects oversized chunked scan-result bodies without content-length', async () => {
    const body = JSON.stringify(oversizedPayload())
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode(body.slice(0, 3000)))
        controller.enqueue(new TextEncoder().encode(body.slice(3000)))
        controller.close()
      },
    })

    const response = await handleAttachmentScanResult(
      new Request('https://my.phiguard.app/api/uploads/scan-result', {
        method: 'POST',
        body: stream,
        duplex: 'half',
        headers: {
          'content-type': 'application/json',
          'x-phiguard-scan-signature': signBody(body),
        },
      } as RequestInit),
    )

    expect(response.status).toBe(413)
    expect(await response.text()).toBe('Scan result payload too large')
    expect(updateTaskAttachmentScanResultMock).not.toHaveBeenCalled()
    expect(updateEvidenceFileScanResultMock).not.toHaveBeenCalled()
  })

  it('rejects unsigned scan results', async () => {
    const response = await handleAttachmentScanResult(
      requestFor({
        organizationId: 'org-1',
        key: 'attachments/org-1/task-1/evidence.txt',
        status: 'clean',
      }),
    )

    expect(response.status).toBe(401)
    expect(updateTaskAttachmentScanResultMock).not.toHaveBeenCalled()
  })

  it('rejects scan results signed with the wrong secret', async () => {
    const payload = {
      organizationId: 'org-1',
      key: 'attachments/org-1/task-1/evidence.txt',
      status: 'clean',
    }

    const response = await handleAttachmentScanResult(
      requestFor(payload, signBody(JSON.stringify(payload), 'wrong')),
    )

    expect(response.status).toBe(401)
    expect(updateTaskAttachmentScanResultMock).not.toHaveBeenCalled()
  })

  it('rejects attachment keys outside the organization upload namespaces', async () => {
    const payload = {
      organizationId: 'org-1',
      key: 'evidence/org-2/checklist-items/item-1/evidence.txt',
      status: 'clean',
      timestamp: '2026-05-01T09:00:00.000Z',
    }
    vi.setSystemTime(new Date('2026-05-01T09:01:00.000Z'))

    const response = await handleAttachmentScanResult(
      requestFor(payload, signBody(JSON.stringify(payload))),
    )

    expect(response.status).toBe(400)
    expect(await response.text()).toBe('Invalid attachment key')
    expect(updateTaskAttachmentScanResultMock).not.toHaveBeenCalled()
  })

  it('rejects signed evidence scan results outside supported evidence namespaces', async () => {
    const payload = {
      organizationId: 'org-1',
      key: 'evidence/org-1/unknown/file.txt',
      status: 'clean',
      timestamp: '2026-05-01T09:00:00.000Z',
    }
    vi.setSystemTime(new Date('2026-05-01T09:01:00.000Z'))

    const response = await handleAttachmentScanResult(
      requestFor(payload, signBody(JSON.stringify(payload))),
    )

    expect(response.status).toBe(400)
    expect(await response.text()).toBe('Invalid attachment key')
    expect(getDbMock).not.toHaveBeenCalled()
    expect(updateTaskAttachmentScanResultMock).not.toHaveBeenCalled()
    expect(updateEvidenceFileScanResultMock).not.toHaveBeenCalled()
  })

  it('marks a scoped evidence file clean from a signed scan result', async () => {
    updateTaskAttachmentScanResultMock.mockResolvedValue(null)
    updateEvidenceFileScanResultMock.mockResolvedValue({
      id: 'scan-1',
      avStatus: 'clean',
    })
    const payload = {
      organizationId: 'org-1',
      key: 'evidence/org-1/checklist-items/item-1/evidence.txt',
      status: 'clean',
      timestamp: '2026-05-01T09:00:00.000Z',
    }
    vi.setSystemTime(new Date('2026-05-01T09:01:00.000Z'))

    const response = await handleAttachmentScanResult(
      requestFor(payload, signBody(JSON.stringify(payload))),
    )

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({
      attachmentId: 'scan-1',
      status: 'clean',
    })
    expect(updateEvidenceFileScanResultMock).toHaveBeenCalledWith(db, {
      tenantId: 'org-1',
      s3Key: 'evidence/org-1/checklist-items/item-1/evidence.txt',
      avStatus: 'clean',
    })
    expect(updateTaskAttachmentScanResultMock).not.toHaveBeenCalled()
  })

  it('marks a scoped attachment clean from a signed scan result', async () => {
    const payload = {
      organizationId: 'org-1',
      key: 'attachments/org-1/task-1/evidence.txt',
      status: 'clean',
      timestamp: '2026-05-01T09:00:00.000Z',
    }
    vi.setSystemTime(new Date('2026-05-01T09:01:00.000Z'))

    const response = await handleAttachmentScanResult(
      requestFor(payload, signBody(JSON.stringify(payload))),
    )

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({
      attachmentId: 'attachment-1',
      status: 'clean',
    })
    expect(updateTaskAttachmentScanResultMock).toHaveBeenCalledWith(db, {
      tenantId: 'org-1',
      s3Key: 'attachments/org-1/task-1/evidence.txt',
      avStatus: 'clean',
    })
    expect(updateEvidenceFileScanResultMock).not.toHaveBeenCalled()
  })

  it('marks a scoped attachment infected from a signed scan result', async () => {
    const payload = {
      organizationId: 'org-1',
      key: 'attachments/org-1/task-1/evidence.txt',
      status: 'infected',
      timestamp: '2026-05-01T09:00:00.000Z',
    }
    vi.setSystemTime(new Date('2026-05-01T09:01:00.000Z'))

    const response = await handleAttachmentScanResult(
      requestFor(payload, signBody(JSON.stringify(payload))),
    )

    expect(response.status).toBe(200)
    expect(updateTaskAttachmentScanResultMock).toHaveBeenCalledWith(db, {
      tenantId: 'org-1',
      s3Key: 'attachments/org-1/task-1/evidence.txt',
      avStatus: 'infected',
    })
    expect(updateEvidenceFileScanResultMock).not.toHaveBeenCalled()
  })

  it('treats duplicate signed scan-result callbacks as accepted', async () => {
    updateTaskAttachmentScanResultMock.mockResolvedValue({
      id: 'attachment-1',
      avStatus: 'clean',
    })
    const payload = {
      organizationId: 'org-1',
      key: 'attachments/org-1/task-1/evidence.txt',
      status: 'clean',
      timestamp: '2026-05-01T09:00:00.000Z',
    }
    vi.setSystemTime(new Date('2026-05-01T09:01:00.000Z'))

    const response = await handleAttachmentScanResult(
      requestFor(payload, signBody(JSON.stringify(payload))),
    )

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({
      attachmentId: 'attachment-1',
      status: 'clean',
    })
  })
})
