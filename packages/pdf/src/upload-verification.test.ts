import { describe, expect, it } from 'vitest'
import { shouldTreatExistingR2PdfAsVerified } from './upload-verification.js'

describe('PDF upload verification', () => {
  const rendered = {
    sizeBytes: 15,
    sha256: 'rendered-hash',
  }

  it('verifies an existing stored PDF only when size and hash match the rendered PDF', () => {
    expect(
      shouldTreatExistingR2PdfAsVerified({
        rendered,
        existing: { sizeBytes: 15, sha256: 'rendered-hash' },
      }),
    ).toBe(true)

    expect(
      shouldTreatExistingR2PdfAsVerified({
        rendered,
        existing: { sizeBytes: 15, sha256: 'stale-hash' },
      }),
    ).toBe(false)

    expect(
      shouldTreatExistingR2PdfAsVerified({
        rendered,
        existing: { sizeBytes: 14, sha256: 'rendered-hash' },
      }),
    ).toBe(false)
  })
})
