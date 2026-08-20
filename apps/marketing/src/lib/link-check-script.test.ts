import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { resolveReportPath } from '../../scripts/link-check-report-path.mjs'

const projectRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  '..',
)
describe('link-check script', () => {
  it('uses a separate report path for internal-only checks', () => {
    const auditDir = path.join(projectRoot, 'seo-audit', '2026-04-24')

    expect(resolveReportPath(auditDir, false)).toBe(path.join(auditDir, 'broken-links.md'))
    expect(resolveReportPath(auditDir, true)).toBe(
      path.join(auditDir, 'broken-links-internal.md'),
    )
  })
})
