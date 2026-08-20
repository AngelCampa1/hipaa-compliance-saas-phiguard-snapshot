export interface PdfObjectFingerprint {
  sizeBytes: number
  sha256: string
}

export function shouldTreatExistingR2PdfAsVerified(input: {
  rendered: PdfObjectFingerprint
  existing: PdfObjectFingerprint
}) {
  return (
    input.existing.sizeBytes === input.rendered.sizeBytes &&
    input.existing.sha256 === input.rendered.sha256
  )
}
