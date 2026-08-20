import { beforeEach, describe, expect, it, vi } from 'vitest'
import { handleDirectUpload } from './uploads.direct'

const {
  getSessionFnMock,
  getDbMock,
  resolveActiveLocationAccessMock,
  assertCommercialProductAccessMock,
  canWriteLocationsMock,
  isMockUploadsEnabledMock,
  putUploadedObjectMock,
  verifyDirectUploadCapabilityMock,
  createProductAnalyticsMock,
  captureMock,
} = vi.hoisted(() => ({
  getSessionFnMock: vi.fn(),
  getDbMock: vi.fn(),
  resolveActiveLocationAccessMock: vi.fn(),
  assertCommercialProductAccessMock: vi.fn(),
  canWriteLocationsMock: vi.fn(),
  isMockUploadsEnabledMock: vi.fn(),
  putUploadedObjectMock: vi.fn(),
  verifyDirectUploadCapabilityMock: vi.fn(),
  createProductAnalyticsMock: vi.fn(),
  captureMock: vi.fn(),
}))

vi.mock('../../lib/session.js', () => ({
  getSessionFn: getSessionFnMock,
}))

vi.mock('@phiguard/db/server', () => ({
  getDb: getDbMock,
}))

vi.mock('../../server/access.js', () => ({
  resolveActiveLocationAccess: resolveActiveLocationAccessMock,
  assertCommercialProductAccess: assertCommercialProductAccessMock,
  canWriteLocations: canWriteLocationsMock,
}))

vi.mock('../../lib/s3.js', () => ({
  ALLOWED_UPLOAD_CONTENT_TYPES: new Set(['text/plain']),
  MAX_UPLOAD_BYTES: 5,
  UPLOAD_OBJECT_ALREADY_EXISTS_MESSAGE: 'Upload capability has already been used',
  isMockUploadsEnabled: isMockUploadsEnabledMock,
  putUploadedObject: putUploadedObjectMock,
  verifyDirectUploadCapability: verifyDirectUploadCapabilityMock,
}))

vi.mock('../../lib/product-analytics.js', () => ({
  createProductAnalytics: createProductAnalyticsMock,
  captureServerProductAnalyticsEvent: (input: {
    userId: string
    organizationId: string
    eventName: string
    properties?: Record<string, unknown>
  }) => {
    createProductAnalyticsMock({
      distinctId: input.userId,
      organization: { id: input.organizationId },
    })
    void captureMock(input.eventName, input.properties)
  },
}))

function requestFor(path: string, body: BodyInit = 'hello', headers: HeadersInit = {}) {
  return new Request(`https://my.phiguard.app${path}`, {
    method: 'PUT',
    body,
    duplex: body instanceof ReadableStream ? 'half' : undefined,
    headers: {
      'content-type': 'text/plain',
      ...headers,
    },
  } as RequestInit)
}

describe('direct uploads route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    isMockUploadsEnabledMock.mockReturnValue(false)
    getSessionFnMock.mockResolvedValue({
      user: { id: 'user-1' },
      session: { activeOrganizationId: 'org-1' },
    })
    getDbMock.mockReturnValue({ id: 'db' })
    resolveActiveLocationAccessMock.mockResolvedValue({
      userId: 'user-1',
      organizationId: 'org-1',
      role: 'org_admin',
      commercial: { planStatus: 'active' },
    })
    assertCommercialProductAccessMock.mockImplementation(() => undefined)
    canWriteLocationsMock.mockReturnValue(true)
    captureMock.mockResolvedValue(undefined)
    createProductAnalyticsMock.mockReturnValue({
      capture: captureMock,
      identifyOrganization: vi.fn(),
    })
    verifyDirectUploadCapabilityMock.mockReturnValue({
      organizationId: 'org-1',
      key: 'attachments/org-1/task-1/evidence.txt',
      contentType: 'text/plain',
      maxBytes: 5,
    })
  })

  it('requires a valid direct upload capability', async () => {
    verifyDirectUploadCapabilityMock.mockReturnValue(null)

    const response = await handleDirectUpload(
      requestFor('/api/uploads/direct?key=attachments/org-1/task-1/evidence.txt'),
    )

    expect(response.status).toBe(403)
    expect(await response.text()).toBe('Invalid upload capability')
    expect(putUploadedObjectMock).not.toHaveBeenCalled()
  })

  it('treats verifier failures as invalid capabilities instead of storing uploads', async () => {
    verifyDirectUploadCapabilityMock.mockImplementation(() => {
      throw new Error('DIRECT_UPLOAD_SECRET is required for direct uploads')
    })

    const response = await handleDirectUpload(
      requestFor('/api/uploads/direct?key=attachments/org-1/task-1/evidence.txt&token=bad'),
    )

    expect(response.status).toBe(403)
    expect(await response.text()).toBe('Invalid upload capability')
    expect(putUploadedObjectMock).not.toHaveBeenCalled()
  })

  it('rejects stale active organization sessions before storing direct uploads', async () => {
    resolveActiveLocationAccessMock.mockRejectedValue(new Error('No active organization'))

    const response = await handleDirectUpload(
      requestFor('/api/uploads/direct?key=attachments/org-1/task-1/evidence.txt&token=capability'),
    )

    expect(response.status).toBe(401)
    expect(await response.text()).toBe('No active organization')
    expect(putUploadedObjectMock).not.toHaveBeenCalled()
  })

  it('rejects commercially locked organizations before storing direct uploads', async () => {
    assertCommercialProductAccessMock.mockImplementation(() => {
      throw new Error('Billing action required before accessing PHIGuard.')
    })

    const response = await handleDirectUpload(
      requestFor('/api/uploads/direct?key=attachments/org-1/task-1/evidence.txt&token=capability'),
    )

    expect(response.status).toBe(403)
    expect(await response.text()).toBe('Billing action required before accessing PHIGuard.')
    expect(putUploadedObjectMock).not.toHaveBeenCalled()
    expect(captureMock).toHaveBeenCalledWith('file_upload_failed', {
      route: '/api/uploads/direct',
      category: 'unknown',
      status: 'failed',
      reason: 'access_denied',
    })
  })

  it('rejects read-only users before storing direct uploads', async () => {
    canWriteLocationsMock.mockReturnValue(false)

    const response = await handleDirectUpload(
      requestFor('/api/uploads/direct?key=attachments/org-1/task-1/evidence.txt&token=capability'),
    )

    expect(response.status).toBe(403)
    expect(await response.text()).toBe('Read-only users cannot upload files')
    expect(putUploadedObjectMock).not.toHaveBeenCalled()
  })

  it('rejects capabilities for another organization', async () => {
    verifyDirectUploadCapabilityMock.mockReturnValue({
      organizationId: 'org-2',
      key: 'attachments/org-2/task-1/evidence.txt',
      contentType: 'text/plain',
      maxBytes: 5,
    })

    const response = await handleDirectUpload(
      requestFor('/api/uploads/direct?key=attachments/org-1/task-1/evidence.txt'),
    )

    expect(response.status).toBe(403)
    expect(putUploadedObjectMock).not.toHaveBeenCalled()
  })

  it('rejects content types outside the signed capability', async () => {
    const response = await handleDirectUpload(
      requestFor('/api/uploads/direct?key=attachments/org-1/task-1/evidence.txt', 'hello', {
        'content-type': 'application/x-msdownload',
      }),
    )

    expect(response.status).toBe(400)
    expect(await response.text()).toBe('File type not allowed')
    expect(putUploadedObjectMock).not.toHaveBeenCalled()
  })

  it('rejects streamed uploads that exceed the byte limit without content-length', async () => {
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode('hello!'))
        controller.close()
      },
    })

    const response = await handleDirectUpload(
      requestFor('/api/uploads/direct?key=attachments/org-1/task-1/evidence.txt', stream),
    )

    expect(response.status).toBe(413)
    expect(await response.text()).toBe('File exceeds 25 MB limit')
    expect(putUploadedObjectMock).not.toHaveBeenCalled()
  })

  it('rejects empty uploads before storing an object', async () => {
    const response = await handleDirectUpload(
      requestFor(
        '/api/uploads/direct?key=attachments/org-1/task-1/evidence.txt&token=capability',
        '',
      ),
    )

    expect(response.status).toBe(400)
    expect(await response.text()).toBe('Missing upload body')
    expect(putUploadedObjectMock).not.toHaveBeenCalled()
  })

  it('stores valid uploads after checking the signed scope', async () => {
    const response = await handleDirectUpload(
      requestFor('/api/uploads/direct?key=attachments/org-1/task-1/evidence.txt&token=capability'),
    )

    expect(response.status).toBe(204)
    expect(verifyDirectUploadCapabilityMock).toHaveBeenCalledWith('capability')
    expect(putUploadedObjectMock).toHaveBeenCalledWith({
      key: 'attachments/org-1/task-1/evidence.txt',
      body: expect.any(Uint8Array),
      contentType: 'text/plain',
      rejectIfExists: true,
    })
    expect(createProductAnalyticsMock).toHaveBeenCalledWith(
      expect.objectContaining({
        distinctId: 'user-1',
        organization: { id: 'org-1' },
      }),
    )
    expect(captureMock).toHaveBeenCalledWith('file_upload_completed', {
      route: '/api/uploads/direct',
      category: 'task_attachment',
      status: 'completed',
    })
  })

  it('does not wait for slow analytics before returning successful upload responses', async () => {
    captureMock.mockReturnValue(new Promise(() => undefined))

    const response = await handleDirectUpload(
      requestFor('/api/uploads/direct?key=attachments/org-1/task-1/evidence.txt&token=capability'),
    )

    expect(response.status).toBe(204)
    expect(captureMock).toHaveBeenCalledWith('file_upload_completed', {
      route: '/api/uploads/direct',
      category: 'task_attachment',
      status: 'completed',
    })
  })

  it('captures handled upload failures with coarse PHI-safe reasons only', async () => {
    verifyDirectUploadCapabilityMock.mockReturnValue(null)

    const response = await handleDirectUpload(
      requestFor('/api/uploads/direct?key=attachments/org-1/task-1/evidence.txt&token=bad'),
    )

    expect(response.status).toBe(403)
    expect(captureMock).toHaveBeenCalledWith('file_upload_failed', {
      route: '/api/uploads/direct',
      category: 'task_attachment',
      status: 'failed',
      reason: 'invalid_capability',
    })
    const [, properties] = captureMock.mock.calls[0]!
    expect(JSON.stringify(properties)).not.toContain('attachments/org-1/task-1/evidence.txt')
    expect(JSON.stringify(properties)).not.toContain('evidence.txt')
    expect(JSON.stringify(properties)).not.toContain('token')
  })

  it('stores direct uploads for the resolved organization when the session active organization is stale', async () => {
    getSessionFnMock.mockResolvedValue({
      user: { id: 'user-1' },
      session: { activeOrganizationId: 'org-stale' },
    })
    resolveActiveLocationAccessMock.mockResolvedValue({
      userId: 'user-1',
      organizationId: 'org-1',
      role: 'org_admin',
      commercial: { planStatus: 'active' },
    })

    const response = await handleDirectUpload(
      requestFor('/api/uploads/direct?key=attachments/org-1/task-1/evidence.txt&token=capability'),
    )

    expect(response.status).toBe(204)
    expect(putUploadedObjectMock).toHaveBeenCalledWith({
      key: 'attachments/org-1/task-1/evidence.txt',
      body: expect.any(Uint8Array),
      contentType: 'text/plain',
      rejectIfExists: true,
    })
  })

  it('rejects object overwrites even when no scan row exists yet', async () => {
    putUploadedObjectMock.mockRejectedValueOnce(
      new Error('Upload capability has already been used'),
    )

    const response = await handleDirectUpload(
      requestFor('/api/uploads/direct?key=attachments/org-1/task-1/evidence.txt&token=capability'),
    )

    expect(response.status).toBe(409)
    expect(await response.text()).toBe('Upload capability has already been used')
  })

  it('rejects reused capabilities after an uploaded task attachment creates any scan row', async () => {
    getDbMock.mockReturnValue({
      query: {
        taskAttachments: {
          findFirst: vi.fn().mockResolvedValue({ avStatus: 'pending' }),
        },
        evidenceFileScans: {
          findFirst: vi.fn().mockResolvedValue(null),
        },
      },
    })

    const response = await handleDirectUpload(
      requestFor('/api/uploads/direct?key=attachments/org-1/task-1/evidence.txt&token=capability'),
    )

    expect(response.status).toBe(409)
    expect(await response.text()).toBe('Upload capability has already been used')
    expect(putUploadedObjectMock).not.toHaveBeenCalled()
  })

  it('rejects reused evidence upload capabilities while scan is still pending', async () => {
    verifyDirectUploadCapabilityMock.mockReturnValue({
      organizationId: 'org-1',
      key: 'evidence/org-1/vendor-baas/vendor-1/baa.txt',
      contentType: 'text/plain',
      maxBytes: 5,
    })
    getDbMock.mockReturnValue({
      query: {
        taskAttachments: {
          findFirst: vi.fn().mockResolvedValue(null),
        },
        evidenceFileScans: {
          findFirst: vi.fn().mockResolvedValue({ avStatus: 'pending' }),
        },
      },
    })

    const response = await handleDirectUpload(
      requestFor(
        '/api/uploads/direct?key=evidence/org-1/vendor-baas/vendor-1/baa.txt&token=capability',
      ),
    )

    expect(response.status).toBe(409)
    expect(await response.text()).toBe('Upload capability has already been used')
    expect(putUploadedObjectMock).not.toHaveBeenCalled()
  })

  it('stores vendor BAA evidence uploads under the organization evidence namespace', async () => {
    verifyDirectUploadCapabilityMock.mockReturnValue({
      organizationId: 'org-1',
      key: 'evidence/org-1/vendor-baas/vendor-1/baa.txt',
      contentType: 'text/plain',
      maxBytes: 5,
    })

    const response = await handleDirectUpload(
      requestFor(
        '/api/uploads/direct?key=evidence/org-1/vendor-baas/vendor-1/baa.txt&token=capability',
      ),
    )

    expect(response.status).toBe(204)
    expect(putUploadedObjectMock).toHaveBeenCalledWith({
      key: 'evidence/org-1/vendor-baas/vendor-1/baa.txt',
      body: expect.any(Uint8Array),
      contentType: 'text/plain',
      rejectIfExists: true,
    })
  })

  it('stores training certificate uploads under the organization evidence namespace', async () => {
    verifyDirectUploadCapabilityMock.mockReturnValue({
      organizationId: 'org-1',
      key: 'evidence/org-1/training-certificates/record-1/certificate.txt',
      contentType: 'text/plain',
      maxBytes: 5,
    })

    const response = await handleDirectUpload(
      requestFor(
        '/api/uploads/direct?key=evidence/org-1/training-certificates/record-1/certificate.txt&token=capability',
      ),
    )

    expect(response.status).toBe(204)
    expect(putUploadedObjectMock).toHaveBeenCalledWith({
      key: 'evidence/org-1/training-certificates/record-1/certificate.txt',
      body: expect.any(Uint8Array),
      contentType: 'text/plain',
      rejectIfExists: true,
    })
  })

  it('rejects training certificate uploads when the token is scoped to a different key', async () => {
    verifyDirectUploadCapabilityMock.mockReturnValue({
      organizationId: 'org-1',
      key: 'evidence/org-1/training-certificates/record-2/certificate.txt',
      contentType: 'text/plain',
      maxBytes: 5,
    })

    const response = await handleDirectUpload(
      requestFor(
        '/api/uploads/direct?key=evidence/org-1/training-certificates/record-1/certificate.txt&token=capability',
      ),
    )

    expect(response.status).toBe(403)
    expect(await response.text()).toBe('Invalid upload capability')
    expect(putUploadedObjectMock).not.toHaveBeenCalled()
  })

  it('rejects unsupported evidence namespaces before storing direct uploads', async () => {
    verifyDirectUploadCapabilityMock.mockReturnValue({
      organizationId: 'org-1',
      key: 'evidence/org-1/unknown/file.txt',
      contentType: 'text/plain',
      maxBytes: 5,
    })

    const response = await handleDirectUpload(
      requestFor('/api/uploads/direct?key=evidence/org-1/unknown/file.txt&token=capability'),
    )

    expect(response.status).toBe(400)
    expect(await response.text()).toBe('Invalid upload key')
    expect(putUploadedObjectMock).not.toHaveBeenCalled()
  })
})
