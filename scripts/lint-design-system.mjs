#!/usr/bin/env node
/**
 * Design-system compliance linter.
 *
 * Fails CI on design-value drift from the PHIGuard token system. Catches:
 *
 *   1. Inline React `style={{…}}` with hex / rgb / rgba / hsl colour literals
 *      or raw px / rem / em sizing in apps/**\/*.{tsx,ts}.
 *
 *   2. Tailwind arbitrary-value classes like `text-[12px]`, `bg-[#fff]`,
 *      `leading-[1.7]`, `rounded-[10px]` in apps/**\/*.{tsx,astro}.
 *
 *   3. Non-DS Tailwind palette classes (slate, zinc, neutral, stone,
 *      yellow, lime, emerald, cyan, sky, indigo, violet, purple, fuchsia,
 *      pink, rose). These palettes are reset to `initial` in the @theme
 *      block, but this linter surfaces them as a helpful error message
 *      instead of a silent miss.
 *
 * Tokens live in packages/ui/src/tokens.css and are exposed to Tailwind
 * through apps/{web,marketing}/src/styles/*.css.
 *
 * To add a legitimate one-off value, add a token first and reference it.
 */

import { readFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join, relative } from 'node:path'

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)))

const TARGET_DIRS = [
  'apps/web/src',
  'apps/marketing/src',
  'packages/ui/src',
]
const TARGET_EXT = new Set(['.tsx', '.ts', '.astro'])

const EXCLUDE_RE = /\.(test|spec|d)\.(tsx?|astro)$/
const EXCLUDE_PATHS = [
  /node_modules/,
  /\.worktrees/,
  /dist\//,
  /\.astro\//,
  /__snapshots__/,
  /src\/routes\/api\/.*\.test\./,
  /src\/server\/unsubscribe\.ts$/, // uses UUID regex, not CSS
  /src\/middleware\/security-headers\.test\./, // CSP regex
  /src\/pages\/resources\/thank-you\.astro$/, // UUID regex
  /src\/pages\/resources\/\[slug\]\.astro$/,
]

// Permit inline `style={{}}` only when it contains a single dynamic value
// (e.g., width/transform driven by state). Flag any color/size literal.
const INLINE_STYLE_RE = /style=\{\{([^}]*)\}\}/g
const INLINE_STYLE_LITERAL_RE =
  /:\s*['"`](?:#[0-9a-fA-F]{3,8}|rgba?\(|hsla?\(|-?\d*\.?\d+(?:rem|em|px|vh|vw)\b)/

// Tailwind arbitrary-value classes: `<prop>-[<value>]`.
const ARBITRARY_CLASS_RE =
  /\b(?:text|bg|border|ring|shadow|leading|tracking|rounded|from|to|via|fill|stroke|accent|caret|decoration|placeholder|divide|outline|size|w|h|min-w|min-h|max-w|max-h|p|px|py|pt|pr|pb|pl|m|mx|my|mt|mr|mb|ml|gap|space-x|space-y|inset|top|right|bottom|left|grid-cols|grid-rows|col-span|row-span|order|duration|delay|translate-x|translate-y|rotate|scale|opacity)-\[[^\]]+\]/g

// Non-DS palettes. brand/blue/green/red/amber/orange/gray/success/warning/
// danger/brand/surface/phi-warn are legitimate DS tokens and excluded.
const NON_DS_PALETTE_RE =
  /\b(?:text|bg|border|ring|from|to|via|fill|stroke|shadow|divide|outline|accent|caret|decoration|placeholder)-(?:slate|zinc|neutral|stone|yellow|lime|emerald|cyan|sky|indigo|violet|purple|fuchsia|pink|rose|gray|green|red|amber|orange)-\d{2,3}\b/g

const violations = []

function isExcluded(path) {
  if (EXCLUDE_RE.test(path)) return true
  return EXCLUDE_PATHS.some((re) => re.test(path))
}

function scanFile(absPath) {
  const rel = relative(ROOT, absPath).replace(/\\/g, '/')
  if (isExcluded(rel)) return

  const source = readFileSync(absPath, 'utf8')
  const lines = source.split('\n')

  // 1. Inline-style literals
  let match
  INLINE_STYLE_RE.lastIndex = 0
  while ((match = INLINE_STYLE_RE.exec(source)) !== null) {
    if (!INLINE_STYLE_LITERAL_RE.test(match[1])) continue
    const line = source.slice(0, match.index).split('\n').length
    violations.push({
      file: rel,
      line,
      kind: 'inline-style-literal',
      message: `inline style={{...}} contains a color/size literal - use Tailwind utility classes bound to DS tokens instead`,
      snippet: lines[line - 1]?.trim() ?? '',
    })
  }

  // 2. Arbitrary values
  ARBITRARY_CLASS_RE.lastIndex = 0
  while ((match = ARBITRARY_CLASS_RE.exec(source)) !== null) {
    const line = source.slice(0, match.index).split('\n').length
    violations.push({
      file: rel,
      line,
      kind: 'arbitrary-value',
      message: `arbitrary Tailwind value "${match[0]}" - add a design token in packages/ui/src/tokens.css and reference it`,
      snippet: lines[line - 1]?.trim() ?? '',
    })
  }

  // 3. Non-DS palettes
  NON_DS_PALETTE_RE.lastIndex = 0
  while ((match = NON_DS_PALETTE_RE.exec(source)) !== null) {
    const line = source.slice(0, match.index).split('\n').length
    violations.push({
      file: rel,
      line,
      kind: 'non-ds-palette',
      message: `non-DS Tailwind palette class "${match[0]}" - use brand/blue/success/warning/danger/surface/phi-warn instead`,
      snippet: lines[line - 1]?.trim() ?? '',
    })
  }
}

function walk(dir) {
  let entries
  try {
    entries = readdirSync(dir, { withFileTypes: true })
  } catch {
    return
  }
  for (const entry of entries) {
    const p = join(dir, entry.name)
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name === '.astro') continue
      walk(p)
    } else if (entry.isFile()) {
      const ext = entry.name.slice(entry.name.lastIndexOf('.'))
      if (TARGET_EXT.has(ext)) scanFile(p)
    }
  }
}

for (const dir of TARGET_DIRS) walk(join(ROOT, dir))

if (violations.length === 0) {
  console.log('✓ Design-system lint passed - no hardcoded values found.')
  process.exit(0)
}

const byKind = violations.reduce((acc, v) => {
  acc[v.kind] = (acc[v.kind] ?? 0) + 1
  return acc
}, {})

console.error(`✗ Design-system lint failed (${violations.length} violations)`)
console.error(`  ${Object.entries(byKind).map(([k, n]) => `${k}: ${n}`).join(', ')}`)
console.error('')

for (const v of violations) {
  console.error(`  ${v.file}:${v.line}  [${v.kind}]`)
  console.error(`    ${v.message}`)
  console.error(`    → ${v.snippet}`)
  console.error('')
}

process.exit(1)
