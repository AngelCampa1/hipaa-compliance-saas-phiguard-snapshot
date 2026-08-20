import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  getAttachmentsBucketBinding,
  getAttachmentsBucketName,
  getAuditExportsBucketBinding,
  getAuditExportsBucketName,
  getLeadMagnetsBucketBinding,
  getLeadMagnetsBucketName,
  getObjectStoragePublicOrigin,
  setObjectStorageBindings,
} from '../object-storage.js'
import type { ObjectStorageBucket } from '../object-storage.js'

function makeMockBucket(): ObjectStorageBucket {
  return {
    get: vi.fn().mockResolvedValue(null),
    head: vi.fn().mockResolvedValue(null),
    put: vi.fn().mockResolvedValue(undefined),
  }
}

const ENV_KEYS = [
  'ATTACHMENTS_BUCKET_NAME',
  'R2_ATTACHMENTS_BUCKET',
  'AUDIT_EXPORTS_BUCKET_NAME',
  'R2_AUDIT_EXPORTS_BUCKET',
  'LEAD_MAGNETS_BUCKET',
  'R2_LEAD_MAGNETS_BUCKET',
  'OBJECT_STORAGE_PUBLIC_ORIGIN',
  'R2_PUBLIC_ORIGIN',
] as const

let savedEnv: Partial<Record<(typeof ENV_KEYS)[number], string | undefined>>

beforeEach(() => {
  savedEnv = {}
  for (const key of ENV_KEYS) {
    savedEnv[key] = process.env[key]
    delete process.env[key]
  }
  setObjectStorageBindings(undefined)
})

afterEach(() => {
  for (const key of ENV_KEYS) {
    if (savedEnv[key] !== undefined) {
      process.env[key] = savedEnv[key]
    } else {
      delete process.env[key]
    }
  }
  setObjectStorageBindings(undefined)
})

describe('setObjectStorageBindings + getAttachmentsBucketBinding', () => {
  it('stores a valid attachments bucket and returns it', () => {
    const bucket = makeMockBucket()
    setObjectStorageBindings({ attachments: bucket })
    expect(getAttachmentsBucketBinding()).toBe(bucket)
  })

  it('returns null when no binding has been registered', () => {
    expect(getAttachmentsBucketBinding()).toBeNull()
  })

  it('ignores an invalid bucket object', () => {
    const invalid = { get: vi.fn(), head: vi.fn() } as unknown as ObjectStorageBucket
    setObjectStorageBindings({ attachments: invalid })
    expect(getAttachmentsBucketBinding()).toBeNull()
  })

  it('clears a previously registered binding when called with undefined', () => {
    const bucket = makeMockBucket()
    setObjectStorageBindings({ attachments: bucket })
    setObjectStorageBindings(undefined)
    expect(getAttachmentsBucketBinding()).toBeNull()
  })
})

describe('getAuditExportsBucketBinding', () => {
  it('returns the explicitly registered auditExports binding', () => {
    const bucket = makeMockBucket()
    setObjectStorageBindings({ auditExports: bucket })
    expect(getAuditExportsBucketBinding()).toBe(bucket)
  })

  it('returns null when no binding has been registered', () => {
    expect(getAuditExportsBucketBinding()).toBeNull()
  })
})

describe('getLeadMagnetsBucketBinding', () => {
  it('returns the registered leadMagnets binding', () => {
    const bucket = makeMockBucket()
    setObjectStorageBindings({ leadMagnets: bucket })
    expect(getLeadMagnetsBucketBinding()).toBe(bucket)
  })

  it('returns null when no binding has been registered', () => {
    expect(getLeadMagnetsBucketBinding()).toBeNull()
  })
})

describe('bucket name helpers', () => {
  it('returns ATTACHMENTS_BUCKET_NAME when set', () => {
    process.env.ATTACHMENTS_BUCKET_NAME = 'attachments'
    expect(getAttachmentsBucketName()).toBe('attachments')
  })

  it('falls back to R2_ATTACHMENTS_BUCKET when the generic name is absent', () => {
    process.env.R2_ATTACHMENTS_BUCKET = 'r2-attachments'
    expect(getAttachmentsBucketName()).toBe('r2-attachments')
  })

  it('returns AUDIT_EXPORTS_BUCKET_NAME when set', () => {
    process.env.AUDIT_EXPORTS_BUCKET_NAME = 'audit-exports'
    expect(getAuditExportsBucketName()).toBe('audit-exports')
  })

  it('falls back to R2_AUDIT_EXPORTS_BUCKET when the generic name is absent', () => {
    process.env.R2_AUDIT_EXPORTS_BUCKET = 'r2-audit-exports'
    expect(getAuditExportsBucketName()).toBe('r2-audit-exports')
  })

  it('returns LEAD_MAGNETS_BUCKET when set', () => {
    process.env.LEAD_MAGNETS_BUCKET = 'lead-magnets'
    expect(getLeadMagnetsBucketName()).toBe('lead-magnets')
  })

  it('falls back to R2_LEAD_MAGNETS_BUCKET when the generic name is absent', () => {
    process.env.R2_LEAD_MAGNETS_BUCKET = 'r2-lead-magnets'
    expect(getLeadMagnetsBucketName()).toBe('r2-lead-magnets')
  })

  it('returns empty strings when names are absent', () => {
    expect(getAttachmentsBucketName()).toBe('')
    expect(getAuditExportsBucketName()).toBe('')
    expect(getLeadMagnetsBucketName()).toBe('')
  })
})

describe('getObjectStoragePublicOrigin', () => {
  it('returns OBJECT_STORAGE_PUBLIC_ORIGIN when set', () => {
    process.env.OBJECT_STORAGE_PUBLIC_ORIGIN = 'https://assets.example.com/path'
    expect(getObjectStoragePublicOrigin()).toBe('https://assets.example.com')
  })

  it('falls back to R2_PUBLIC_ORIGIN when the generic origin is absent', () => {
    process.env.R2_PUBLIC_ORIGIN = 'https://r2.example.com/path'
    expect(getObjectStoragePublicOrigin()).toBe('https://r2.example.com')
  })

  it('returns null when OBJECT_STORAGE_PUBLIC_ORIGIN is not a valid URL', () => {
    process.env.OBJECT_STORAGE_PUBLIC_ORIGIN = 'not-a-valid-url'
    expect(getObjectStoragePublicOrigin()).toBeNull()
  })

  it('returns null when no public origin is configured', () => {
    expect(getObjectStoragePublicOrigin()).toBeNull()
  })
})
