import path from 'node:path'

export function resolveReportPath(auditDirectory, internalOnly) {
  return path.join(
    auditDirectory,
    internalOnly ? 'broken-links-internal.md' : 'broken-links.md',
  )
}
