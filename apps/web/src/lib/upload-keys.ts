const EVIDENCE_UPLOAD_NAMESPACE_PREFIXES = [
  'checklist-items',
  'soc2',
  'training-certificates',
  'vendor-baas',
] as const

export type UploadKeyTarget = 'taskAttachment' | 'evidenceFile'

export function getUploadKeyTarget(key: string, organizationId: string): UploadKeyTarget | null {
  if (key.startsWith(`attachments/${organizationId}/`)) {
    return 'taskAttachment'
  }

  for (const prefix of EVIDENCE_UPLOAD_NAMESPACE_PREFIXES) {
    if (key.startsWith(`evidence/${organizationId}/${prefix}/`)) {
      return 'evidenceFile'
    }
  }

  return null
}

export function isAllowedUploadKey(key: string, organizationId: string) {
  return Boolean(getUploadKeyTarget(key, organizationId))
}
