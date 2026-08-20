import { afterEach, describe, expect, it, vi } from 'vitest'
import { setObjectStorageBindings, type ObjectStorageBucket } from '@phiguard/audit'

import {
  assertObjectExists,
  createDirectDownloadCapability,
  buildTrainingCertificateKey,
  buildVendorBaaEvidenceKey,
  buildLeadMagnetKey,
  generatePresignedDownloadUrl,
  createDirectUploadCapability,
  generatePresignedUploadUrl,
  getLeadMagnetHead,
  getLeadMagnetObject,
  isMockUploadsEnabled,
  putUploadedObject,
  verifyDirectDownloadCapability,
  verifyDirectUploadCapability,
} from './s3'

const originalNodeEnv = process.env.NODE_ENV

describe('lead magnet storage', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    setObjectStorageBindings()
  })

  it('resolves download keys from the configured lead magnet manifest', () => {
    expect(buildLeadMagnetKey('baa-template')).toBe('lead-magnets/baa-template-pack.pdf')
    expect(buildLeadMagnetKey('hipaa-risk-analysis-template')).toBe(
      'lead-magnets/hipaa-risk-analysis-template.pdf',
    )
  })

  it('reads lead magnet PDFs from the runtime object storage binding when available', async () => {
    const body = new ReadableStream()
    const get = vi.fn().mockResolvedValue({
      body,
      httpMetadata: { contentType: 'application/pdf' },
    })

    setObjectStorageBindings({
      leadMagnets: {
        get,
        head: vi.fn(),
        put: vi.fn(),
      } as unknown as ObjectStorageBucket,
    })

    await expect(getLeadMagnetObject('lead-magnets/baa-template.pdf')).resolves.toEqual({
      body,
      httpMetadata: { contentType: 'application/pdf' },
    })
    expect(get).toHaveBeenCalledWith('lead-magnets/baa-template.pdf')
  })

  it('reads lead magnet PDF metadata without downloading the object body', async () => {
    const head = vi.fn().mockResolvedValue({
      httpMetadata: { contentType: 'application/pdf' },
      size: 128,
    })
    const get = vi.fn()

    setObjectStorageBindings({
      leadMagnets: {
        get,
        head,
        put: vi.fn(),
      } as unknown as ObjectStorageBucket,
    })

    await expect(getLeadMagnetHead('lead-magnets/baa-template.pdf')).resolves.toEqual({
      httpMetadata: { contentType: 'application/pdf' },
      size: 128,
    })
    expect(head).toHaveBeenCalledWith('lead-magnets/baa-template.pdf')
    expect(get).not.toHaveBeenCalled()
  })

  it('retries transient lead magnet object reads before failing the download', async () => {
    const body = new ReadableStream()
    const get = vi
      .fn()
      .mockRejectedValueOnce(new Error('get: We encountered an internal error. Please try again. (10001)'))
      .mockResolvedValueOnce({
        body,
        httpMetadata: { contentType: 'application/pdf' },
      })

    setObjectStorageBindings({
      leadMagnets: {
        get,
        head: vi.fn(),
        put: vi.fn(),
      } as unknown as ObjectStorageBucket,
    })

    await expect(getLeadMagnetObject('lead-magnets/baa-template.pdf')).resolves.toEqual({
      body,
      httpMetadata: { contentType: 'application/pdf' },
    })
    expect(get).toHaveBeenCalledTimes(2)
  })
})

describe('attachment direct uploads', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    vi.clearAllMocks()
    setObjectStorageBindings()
    delete process.env.DIRECT_UPLOAD_SECRET
    delete process.env.BETTER_AUTH_SECRET
    delete process.env.ENABLE_MOCK_UPLOADS
    delete process.env.PLAYWRIGHT
    if (originalNodeEnv) {
      process.env.NODE_ENV = originalNodeEnv
    } else {
      delete process.env.NODE_ENV
    }
  })

  it('does not enable mock uploads in production without Playwright', () => {
    process.env.NODE_ENV = 'production'
    process.env.ENABLE_MOCK_UPLOADS = 'true'
    delete process.env.PLAYWRIGHT

    expect(isMockUploadsEnabled()).toBe(false)
  })

  it('enables mock uploads for the explicit Playwright harness', () => {
    process.env.ENABLE_MOCK_UPLOADS = 'true'
    process.env.PLAYWRIGHT = 'true'

    expect(isMockUploadsEnabled()).toBe(true)
  })

  it('creates a direct upload URL with a signed capability for runtime object storage bindings', async () => {
    process.env.DIRECT_UPLOAD_SECRET = 'test-secret'
    setObjectStorageBindings({
      attachments: {
        get: vi.fn(),
        head: vi.fn(),
        put: vi.fn(),
      } as unknown as ObjectStorageBucket,
    })

    const url = await generatePresignedUploadUrl({
      bucket: 'attachments',
      key: 'attachments/org-1/task-1/upload.txt',
      organizationId: 'org-1',
      contentType: 'text/plain',
      sizeBytes: 128,
      expiresIn: 300,
    })

    const parsed = new URL(url, 'https://my.phiguard.app')
    const token = parsed.searchParams.get('token')
    expect(parsed.pathname).toBe('/api/uploads/direct')
    expect(parsed.searchParams.get('key')).toBe('attachments/org-1/task-1/upload.txt')
    expect(token).toBeTruthy()
    expect(verifyDirectUploadCapability(token!)).toEqual(
      expect.objectContaining({
        organizationId: 'org-1',
        key: 'attachments/org-1/task-1/upload.txt',
        contentType: 'text/plain',
        maxBytes: 128,
      }),
    )
  })

  it('fails closed in production when direct upload signing uses no dedicated secret', async () => {
    process.env.NODE_ENV = 'production'
    process.env.BETTER_AUTH_SECRET = 'auth-secret-must-not-sign-uploads'
    setObjectStorageBindings({
      attachments: {
        get: vi.fn(),
        head: vi.fn(),
        put: vi.fn(),
      } as unknown as ObjectStorageBucket,
    })

    await expect(
      generatePresignedUploadUrl({
        bucket: 'attachments',
        key: 'attachments/org-1/task-1/upload.txt',
        organizationId: 'org-1',
        contentType: 'text/plain',
      }),
    ).rejects.toThrow('DIRECT_UPLOAD_SECRET is required for direct uploads')
  })

  it('fails closed without throwing when verifying direct upload capabilities without a secret', () => {
    process.env.NODE_ENV = 'production'
    delete process.env.DIRECT_UPLOAD_SECRET
    delete process.env.BETTER_AUTH_SECRET

    expect(verifyDirectUploadCapability('payload.signature')).toBeNull()
  })

  it('allows local fallback to the auth secret outside production', async () => {
    process.env.NODE_ENV = 'test'
    process.env.BETTER_AUTH_SECRET = 'auth-secret-local-fallback'
    setObjectStorageBindings({
      attachments: {
        get: vi.fn(),
        head: vi.fn(),
        put: vi.fn(),
      } as unknown as ObjectStorageBucket,
    })

    const url = await generatePresignedUploadUrl({
      bucket: 'attachments',
      key: 'attachments/org-1/task-1/upload.txt',
      organizationId: 'org-1',
      contentType: 'text/plain',
    })

    expect(new URL(url, 'https://my.phiguard.app').searchParams.get('token')).toBeTruthy()
  })

  it('rejects tampered direct upload capabilities', async () => {
    process.env.DIRECT_UPLOAD_SECRET = 'test-secret'
    setObjectStorageBindings({
      attachments: {
        get: vi.fn(),
        head: vi.fn(),
        put: vi.fn(),
      } as unknown as ObjectStorageBucket,
    })

    const url = await generatePresignedUploadUrl({
      bucket: 'attachments',
      key: 'attachments/org-1/task-1/upload.txt',
      organizationId: 'org-1',
      contentType: 'text/plain',
    })
    const parsed = new URL(url, 'https://my.phiguard.app')
    const token = parsed.searchParams.get('token')!.replace(/.$/, 'x')

    expect(verifyDirectUploadCapability(token)).toBeNull()
  })

  it('rejects direct upload capabilities with extra token segments', async () => {
    process.env.DIRECT_UPLOAD_SECRET = 'test-secret'
    const token = createDirectUploadCapability({
      organizationId: 'org-1',
      key: 'attachments/org-1/task-1/upload.txt',
      contentType: 'text/plain',
    })

    expect(verifyDirectUploadCapability(`${token}.extra`)).toBeNull()
  })

  it('rejects direct upload capabilities without a positive byte limit', () => {
    process.env.DIRECT_UPLOAD_SECRET = 'test-secret'
    const token = createDirectUploadCapability({
      organizationId: 'org-1',
      key: 'attachments/org-1/task-1/upload.txt',
      contentType: 'text/plain',
      maxBytes: 0,
    })

    expect(verifyDirectUploadCapability(token)).toBeNull()
  })

  it('rejects oversized objects found through the runtime object storage binding', async () => {
    setObjectStorageBindings({
      attachments: {
        get: vi.fn(),
        head: vi.fn().mockResolvedValue({ size: 6 }),
        put: vi.fn(),
      } as unknown as ObjectStorageBucket,
    })

    await expect(
      assertObjectExists({
        bucket: 'attachments',
        key: 'attachments/org-1/task-1/upload.txt',
        maxBytes: 5,
      }),
    ).rejects.toThrow('Uploaded object exceeds the maximum attachment size')
  })

  it('returns stored object metadata from the runtime object storage binding', async () => {
    setObjectStorageBindings({
      attachments: {
        get: vi.fn(),
        head: vi.fn().mockResolvedValue({
          size: 128,
          httpMetadata: { contentType: 'application/pdf' },
        }),
        put: vi.fn(),
      } as unknown as ObjectStorageBucket,
    })

    await expect(
      assertObjectExists({
        bucket: 'attachments',
        key: 'evidence/org-1/soc2/access-review.pdf',
        maxBytes: 1024,
      }),
    ).resolves.toEqual({
      contentType: 'application/pdf',
      sizeBytes: 128,
    })
  })

  it('fails closed when attachment storage bindings are absent', async () => {
    setObjectStorageBindings()

    await expect(
      generatePresignedUploadUrl({
        bucket: 'attachments',
        key: 'attachments/org-1/task-1/upload.txt',
        organizationId: 'org-1',
        contentType: 'text/plain',
        sizeBytes: 128,
        expiresIn: 300,
      }),
    ).rejects.toThrow('Attachment storage is not configured')
  })

  it('creates a direct download URL with a signed capability for runtime object storage bindings', async () => {
    process.env.DIRECT_UPLOAD_SECRET = 'test-secret'
    setObjectStorageBindings({
      attachments: {
        get: vi.fn(),
        head: vi.fn(),
        put: vi.fn(),
      } as unknown as ObjectStorageBucket,
    })

    const url = await generatePresignedDownloadUrl({
      bucket: 'attachments',
      key: 'attachments/org-1/task-1/upload.txt',
      organizationId: 'org-1',
      expiresIn: 900,
    })

    const parsed = new URL(url, 'https://my.phiguard.app')
    const token = parsed.searchParams.get('download')
    expect(parsed.pathname).toBe('/api/uploads/direct')
    expect(parsed.searchParams.get('key')).toBe('attachments/org-1/task-1/upload.txt')
    expect(token).toBeTruthy()
    expect(verifyDirectDownloadCapability(token!)).toEqual(
      expect.objectContaining({
        organizationId: 'org-1',
        key: 'attachments/org-1/task-1/upload.txt',
      }),
    )
  })

  it('rejects direct download capabilities with extra token segments', () => {
    process.env.DIRECT_UPLOAD_SECRET = 'test-secret'
    const token = createDirectDownloadCapability({
      organizationId: 'org-1',
      key: 'attachments/org-1/task-1/upload.txt',
    })

    expect(verifyDirectDownloadCapability(`${token}.extra`)).toBeNull()
  })

  it('uses conditional create-only writes for runtime direct uploads', async () => {
    const put = vi.fn().mockResolvedValue({})
    setObjectStorageBindings({
      attachments: {
        get: vi.fn(),
        head: vi.fn(),
        put,
      } as unknown as ObjectStorageBucket,
    })

    await putUploadedObject({
      key: 'attachments/org-1/task-1/upload.txt',
      body: new Uint8Array([1]),
      contentType: 'text/plain',
      rejectIfExists: true,
    })

    expect(put).toHaveBeenCalledWith(
      'attachments/org-1/task-1/upload.txt',
      expect.any(Uint8Array),
      expect.objectContaining({
        onlyIf: { etagDoesNotMatch: '*' },
      }),
    )
  })

  it('rejects Worker object storage direct upload overwrites when the object already exists', async () => {
    setObjectStorageBindings({
      attachments: {
        get: vi.fn(),
        head: vi.fn(),
        put: vi.fn().mockResolvedValue(null),
      } as unknown as ObjectStorageBucket,
    })

    await expect(
      putUploadedObject({
        key: 'attachments/org-1/task-1/upload.txt',
        body: new Uint8Array([1]),
        contentType: 'text/plain',
        rejectIfExists: true,
      }),
    ).rejects.toThrow('Upload capability has already been used')
  })
})

describe('vendor BAA evidence keys', () => {
  it('stores BAA evidence under the organization and vendor namespace', () => {
    vi.spyOn(Date, 'now').mockReturnValue(1776121200000)

    expect(buildVendorBaaEvidenceKey('org-1', 'vendor-1', 'Signed BAA.pdf')).toBe(
      'evidence/org-1/vendor-baas/vendor-1/1776121200000_Signed_BAA.pdf',
    )
  })
})

describe('training certificate keys', () => {
  it('stores certificates under the organization and training record namespace', () => {
    vi.spyOn(Date, 'now').mockReturnValue(1776121200000)

    expect(buildTrainingCertificateKey('org-1', 'record-1', 'Certificate.pdf')).toBe(
      'evidence/org-1/training-certificates/record-1/1776121200000_Certificate.pdf',
    )
  })
})
