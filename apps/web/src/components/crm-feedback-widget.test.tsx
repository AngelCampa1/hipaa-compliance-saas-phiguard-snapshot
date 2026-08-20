/**
 * Static contract tests for CrmFeedbackWidget.
 *
 * The project's vitest environment is 'node' with no DOM available, so these
 * tests verify correctness by inspecting source text - the same approach used
 * in src/__tests__/app-static-contracts.test.ts.
 */
import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = resolve(__dirname, '..')
const widgetSrc = readFileSync(resolve(__dirname, 'crm-feedback-widget.tsx'), 'utf8')
const appSrc = readFileSync(resolve(root, 'routes/app.tsx'), 'utf8')
const securityHeadersSrc = readFileSync(
  resolve(root, 'middleware/security-headers.ts'),
  'utf8',
)
const envExample = readFileSync(resolve(root, '..', '..', '..', '.env.example'), 'utf8')

describe('CrmFeedbackWidget source contracts', () => {
  it('component file exists', () => {
    expect(existsSync(resolve(__dirname, 'crm-feedback-widget.tsx'))).toBe(true)
  })

  it('reads widget key from VITE_CRM_WIDGET_KEY env var', () => {
    expect(widgetSrc).toContain('VITE_CRM_WIDGET_KEY')
  })

  it('reads loader URL from VITE_CRM_LOADER_URL env var', () => {
    expect(widgetSrc).toContain('VITE_CRM_LOADER_URL')
  })

  it('sets data-widget to "feedback-button"', () => {
    expect(widgetSrc).toContain('feedback-button')
  })

  it('sets data-product from the widget key env var', () => {
    expect(widgetSrc).toContain('data-product')
    expect(widgetSrc).toContain('key')
  })

  it('defaults loader URL to the production CRM origin', () => {
    expect(widgetSrc).toContain('https://crm.example.com/w/v1.js')
  })

  it('returns null (renders nothing) when key is unset', () => {
    expect(widgetSrc).toContain('if (!key) return')
  })

  it('is imported and mounted in the authenticated app shell', () => {
    expect(appSrc).toContain("from '../components/crm-feedback-widget'")
    expect(appSrc).toContain('<CrmFeedbackWidget')
  })

  it('env.example documents VITE_CRM_WIDGET_KEY with a blank value', () => {
    expect(envExample).toContain('VITE_CRM_WIDGET_KEY=')
  })

  it('env.example documents VITE_CRM_LOADER_URL', () => {
    expect(envExample).toContain('VITE_CRM_LOADER_URL=')
  })
})

describe('CSP allows the CRM loader origin', () => {
  it('CRM_LOADER_ORIGIN constant is defined in security-headers.ts', () => {
    expect(securityHeadersSrc).toContain('CRM_LOADER_ORIGIN')
    expect(securityHeadersSrc).toContain('https://crm.example.com')
  })

  it('CRM_LOADER_ORIGIN is included in script-src', () => {
    // The script-src line must reference the constant so the origins stay in sync
    expect(securityHeadersSrc).toMatch(/script-src[^`]*\$\{CRM_LOADER_ORIGIN\}/)
  })

  it('CRM_LOADER_ORIGIN is included in connect-src', () => {
    expect(securityHeadersSrc).toMatch(/connect-src[^`]*\$\{CRM_LOADER_ORIGIN\}/)
  })
})
