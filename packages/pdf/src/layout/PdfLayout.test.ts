import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { pdfColors } from '@phiguard/ui/pdf-tokens'
import { styles } from './PdfLayout'

const layoutSource = readFileSync(resolve(__dirname, 'PdfLayout.tsx'), 'utf8')

describe('PdfLayout tokens', () => {
  it('uses the shared UI PDF colors instead of local hardcoded tokens', () => {
    expect(pdfColors).toEqual({
      primary: '#0f766e',
      text: '#111827',
      muted: '#6b7280',
      line: '#e5e7eb',
      calloutBg: '#f0fdfa',
    })
    expect(layoutSource).toContain("import { pdfColors } from '@phiguard/ui/pdf-tokens'")
    expect(layoutSource).not.toContain('TODO: extract to packages/ui tokens')
    expect(layoutSource).not.toMatch(/const colors\s*=/)
    expect(styles.page.color).toBe(pdfColors.text)
    expect(styles.heading2.color).toBe(pdfColors.primary)
    expect(styles.footer.borderTopColor).toBe(pdfColors.line)
    expect(styles.callout.backgroundColor).toBe(pdfColors.calloutBg)
    expect(layoutSource).toContain('phiguard.app - Page')
    expect(layoutSource).toContain('<Text style={styles.bullet}>-</Text>')
    expect(layoutSource).not.toContain('·')
    expect(layoutSource).not.toContain('•')
  })
})
