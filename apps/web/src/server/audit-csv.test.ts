import { describe, expect, it } from 'vitest'
import { formatCsvField } from './audit.js'

describe('formatCsvField', () => {
  it('escapes embedded double-quotes', () => {
    expect(formatCsvField('"hello"')).toBe('"""hello"""')
    expect(formatCsvField('no,quotes')).toBe('"no,quotes"')
    expect(formatCsvField('')).toBe('""')
  })

  it('defuses spreadsheet formula payloads', () => {
    expect(formatCsvField('=HYPERLINK("https://example.com","click")')).toBe(
      '"\'=HYPERLINK(""https://example.com"",""click"")"',
    )
    expect(formatCsvField('@SUM(1,2)')).toBe('"\'@SUM(1,2)"')
  })
})
