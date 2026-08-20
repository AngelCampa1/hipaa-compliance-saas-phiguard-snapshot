import { existsSync, readFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { join, relative } from 'node:path'
import { describe, expect, it } from 'vitest'
import { SUPPORT_EMAIL } from './support'

const repoRoot = join(import.meta.dirname, '..', '..', '..')
const allowedLiteralFiles = new Set([
  'packages/brand/src/contact.ts',
  'packages/brand/src/identity.ts',
  'packages/brand/src/public-copy.ts',
  'packages/knowledge/src/support.ts',
  'packages/knowledge/src/legal-trust.ts',
  'packages/knowledge/src/public.ts',
  'packages/knowledge/src/email.ts',
  'packages/knowledge/src/marketing-infra.ts',
  'packages/knowledge/src/knowledge.test.ts',
  'packages/knowledge/src/static-contracts.test.ts',
  'packages/knowledge/dist/ai/marketing.json',
  'packages/knowledge/dist/ai/app.json',
  'packages/knowledge/dist/ai/all.json',
])

let fileCache: string[] | null = null

function listFiles(command: string) {
  fileCache ??= [
    execFileSync('git', ['ls-files'], { cwd: repoRoot, encoding: 'utf8' }),
    execFileSync('git', ['ls-files', '--others', '--exclude-standard'], { cwd: repoRoot, encoding: 'utf8' }),
  ]
    .join('\n')
    .split(/\r?\n/)
    .filter(Boolean)
    .filter((file) => existsSync(join(repoRoot, file)))

  return fileCache
    .filter((file) => command === 'all' || file.startsWith(command))
}

describe('knowledge static contracts', () => {
  it('keeps the support email literal centralized in the knowledge package', () => {
    const files = listFiles('all')
      .filter((file) => /\.(astro|tsx?|md|json|txt)$/.test(file))
      .filter((file) => !file.startsWith('apps/marketing/seo-audit/'))
      .filter((file) => !file.startsWith('apps/marketing/public/llms'))
      // Audit and review docs intentionally quote internal strings (including the
      // support email) when reporting on what was found in source. They are not
      // runtime artifacts, so the centralization contract does not apply.
      .filter((file) => !file.startsWith('docs/audits/'))

    const offenders = files.filter((file) => {
      const normalized = relative(repoRoot, join(repoRoot, file)).replace(/\\/g, '/')
      if (allowedLiteralFiles.has(normalized)) return false
      return readFileSync(join(repoRoot, file), 'utf8').includes(SUPPORT_EMAIL)
    })

    expect(offenders).toEqual([])
  }, 30000)

  it('keeps repeated public marketing facts out of page and component literals', () => {
    const offenders = [
      'apps/marketing/src/components/FAQ.astro',
      'apps/marketing/src/components/CTA.astro',
      'apps/marketing/src/components/HeroSection.astro',
      'apps/marketing/src/components/PricingTable.astro',
      'apps/marketing/src/pages/pricing.astro',
      'apps/marketing/src/pages/security.astro',
      'apps/marketing/src/pages/subprocessors.astro',
      'apps/marketing/src/content',
    ].flatMap((file) => {
      const source = file.endsWith('/src/content')
        ? listFiles(file).map((contentFile) => readFileSync(join(repoRoot, contentFile), 'utf8')).join('\n')
        : readFileSync(join(repoRoot, file), 'utf8')
      return [
        'A Business Associate Agreement is a legally required HIPAA contract',
        'Every plan includes a signed Business Associate Agreement and an immutable audit trail',
        'Security claims tied back to product behavior.',
        'Current PostgreSQL provider',
        'No credit card required. Review and sign the BAA during onboarding',
        [
          'PHIGuard uses flat per-clinic pricing with annual billing shown by default, no per-user fees,',
          'and a BAA included on every',
          'public plan.',
        ].join(' '),
        'See [current PHIGuard pricing](/pricing) for plan names, monthly list prices, annual totals, and current limited offer details.',
      ]
        .filter((literal) => source.includes(literal))
        .map((literal) => `${file}: ${literal}`)
    })

    expect(offenders).toEqual([])
  })

  it('keeps generated public knowledge artifacts free of internal routing and source metadata', () => {
    const files = [
      'packages/knowledge/dist/ai/marketing.json',
      'packages/knowledge/dist/ai/app.json',
      'packages/knowledge/dist/ai/public.json',
      'packages/knowledge/dist/ai/emails.json',
      'packages/knowledge/dist/ai/marketing-infra.json',
      'packages/knowledge/dist/ai/all.json',
      'apps/marketing/public/llms.txt',
      'apps/marketing/public/pricing.txt',
    ]
    const denied = [
      '"allowedConsumers"',
      '"module"',
      '@phiguard/',
      'marketing-ai-sdr',
      'app-ai-support',
      'marketing-infra',
      'packages/',
      'apps/',
      'docs/',
      'runbooks/',
      '/app/admin',
      '/app/soc2',
      'Current PostgreSQL provider',
      'BAA required before live PHI',
      'Requires legal review',
      'DATABASE_URL',
      'PROD_E2E',
      'STRIPE_SECRET',
      'RESEND_API',
      'CLOUDFLARE_API',
      '.env',
    ]

    const offenders = files.flatMap((file) => {
      const source = readFileSync(join(repoRoot, file), 'utf8')
      return denied
        .filter((literal) => source.includes(literal))
        .map((literal) => `${file}: ${literal}`)
    })

    expect(offenders).toEqual([])
  })

  it('keeps core public commercial claims in knowledge or generated artifacts', () => {
    const allowed = new Set([
      ...allowedLiteralFiles,
      'packages/knowledge/src/commercial.ts',
      'packages/knowledge/src/marketing.ts',
      'packages/knowledge/src/app.ts',
      'packages/knowledge/src/public.ts',
      'packages/knowledge/src/email.ts',
      'packages/knowledge/src/marketing-infra.ts',
      'packages/email/src/__tests__/templates.test.tsx',
      'apps/marketing/src/lib/static-contracts.test.ts',
      'apps/marketing/public/llms.txt',
      'apps/marketing/public/pricing.txt',
    ])
    const files = listFiles('all')
      .filter((file) => /\.(astro|tsx?|md|json|txt)$/.test(file))
      .filter((file) => !file.startsWith('docs/'))
      .filter((file) => !file.startsWith('apps/marketing/src/content/'))
      .filter((file) => !file.startsWith('packages/knowledge/dist/ai/'))
      .filter((file) => !allowed.has(file))

    const canonicalLiterals = [
      'No credit card required.',
      'BAA included on every plan',
      'flat per-clinic pricing',
      'Flat per-clinic pricing',
      '30-day free trial',
      ['Business Associate Agreement is included on every', 'public plan'].join(' '),
    ]

    const offenders = files.flatMap((file) => {
      const source = readFileSync(join(repoRoot, file), 'utf8')
      return canonicalLiterals
        .filter((literal) => source.includes(literal))
        .map((literal) => `${file}: ${literal}`)
    })

    expect(offenders).toEqual([])
  })

  it('keeps dispatched email shell copy canonicalized', () => {
    const files = listFiles('packages/email/src')
      .filter((file) => /\.(tsx?|json)$/.test(file))
      .filter((file) => !file.includes('/__tests__/'))
      .filter((file) => !file.match(/packages\/email\/src\/templates\/nurture\/(awareness|consideration|decision)-/))
      .filter((file) => !file.endsWith('marketing-email-styles.ts'))

    const localPublicLiterals = [
      'Reset your PHIGuard password',
      'Sign in to your PHIGuard Partner Portal',
      'Your PHIGuard partner application has been received',
      'Welcome to PHIGuard',
      'You have been invited to PHIGuard',
      'Accept invitation',
      'The PDF is ready',
      'Browse our free resources',
      'Unsubscribe',
      'Start free trial',
      'Your PHIGuard trial ends in 3 days',
      'PHIGuard billing',
    ]

    const offenders = files.flatMap((file) => {
      const source = readFileSync(join(repoRoot, file), 'utf8')
      if (file === 'packages/email/src/templates/brand.tsx') return []
      return localPublicLiterals
        .filter((literal) => source.includes(`'${literal}'`) || source.includes(`"${literal}"`) || source.includes(`>${literal}<`))
        .map((literal) => `${file}: ${literal}`)
    })

    expect(offenders).toEqual([])
  })

  it('keeps email template public origins derived from brand identity', () => {
    const files = listFiles('packages/email/src/templates')
      .filter((file) => /\.(tsx?|json)$/.test(file))

    const offenders = files.flatMap((file) => {
      const source = readFileSync(join(repoRoot, file), 'utf8')
      return [
        'https://phiguard.app',
        'https://www.phiguard.app',
        'https://my.phiguard.app',
      ]
        .filter((literal) => source.includes(literal))
        .map((literal) => `${file}: ${literal}`)
    })

    expect(offenders).toEqual([])
  })

  it('keeps public copy free of common mojibake sequences', () => {
    const files = listFiles('all')
      .filter((file) => /\.(astro|tsx?|md|json|txt)$/.test(file))
      .filter((file) => !file.startsWith('docs/'))
      .filter((file) => !file.startsWith('apps/marketing/seo-audit/'))
      .filter((file) => !file.startsWith('packages/knowledge/dist/ai/'))
      .filter((file) => !file.endsWith('.test.ts'))
      .filter((file) => !file.endsWith('.test.tsx'))

    const mojibake = ['Ã', 'â€”', 'â€“', 'â€™']
    const offenders = files.flatMap((file) => {
      const source = readFileSync(join(repoRoot, file), 'utf8')
      return mojibake
        .filter((literal) => source.includes(literal))
        .map((literal) => `${file}: ${literal}`)
    })

    expect(offenders).toEqual([])
  })

  it('keeps the dissolved corporate identity out of the published source', () => {
    // PHIGuard was operated by a corporation that has since been dissolved. Its
    // name, registered-agent address, and the founder's full legal name were
    // removed when this repository was prepared for publication. This guards
    // that scrub against regressions.
    //
    // The needles are base64 so that the guard does not itself republish the
    // three strings it exists to keep out — a plaintext list here would put the
    // legal name and street address back into the tree in the one file that is
    // exempt from the check. Decoding at runtime also means this file is not
    // exempt: it is scanned like every other.
    const forbidden = [
      'VmVudG9yYSBMYWJz',
      'QW5nZWwgT21hciBDYW1wYSBDYW50dQ==',
      'MzAgTiBHb3VsZCBTdCBTdGUgTiwgU2hlcmlkYW4sIFdZIDgyODAx',
    ].map((encoded) => Buffer.from(encoded, 'base64').toString('utf8'))

    const files = listFiles('all').filter((file) => /\.(astro|tsx?|md|json|txt)$/.test(file))

    const offenders = files.flatMap((file) => {
      const source = readFileSync(join(repoRoot, file), 'utf8')
      return forbidden
        .filter((literal) => source.includes(literal))
        .map((literal) => `${file}: ${literal}`)
    })

    expect(offenders).toEqual([])
  })
})
