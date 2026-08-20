import { describe, expect, it } from 'vitest'
import { applyObjectStorageHttpMetadata } from './object-storage'

describe('applyObjectStorageHttpMetadata', () => {
  it('copies explicit http metadata onto headers', () => {
    const headers = new Headers()

    applyObjectStorageHttpMetadata(headers, {
      httpMetadata: {
        contentType: 'application/pdf',
        contentEncoding: 'gzip',
      },
    })

    expect(headers.get('Content-Type')).toBe('application/pdf')
    expect(headers.get('Content-Encoding')).toBe('gzip')
  })

  it('ignores writeHttpMetadata failures when explicit metadata is available', () => {
    const headers = new Headers()

    applyObjectStorageHttpMetadata(headers, {
      httpMetadata: {
        contentType: 'application/pdf',
      },
      writeHttpMetadata() {
        throw new TypeError('Illegal invocation')
      },
    })

    expect(headers.get('Content-Type')).toBe('application/pdf')
  })
})
