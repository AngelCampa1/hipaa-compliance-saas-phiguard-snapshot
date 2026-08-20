import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { relative, resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { contributors } from './contributors'
import { footerLinkGroups, internalPath, resourcesMegaMenuGroups } from './internal-links'
import { buildArticleSchema, buildPersonSchema } from './seo'

const root = resolve(__dirname, '..')
const workspaceRoot = resolve(root, '..', '..', '..')

function readSource(relativePath: string) {
  return readFileSync(resolve(root, relativePath), 'utf8')
}

function readProjectSource(relativePath: string) {
  return readFileSync(resolve(workspaceRoot, relativePath), 'utf8')
}

function readContentSources(relativePath: string): string[] {
  const sourceRoot = resolve(root, relativePath)
  const sources: string[] = []
  const visit = (dir: string) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const fullPath = resolve(dir, entry.name)
      if (entry.isDirectory()) {
        visit(fullPath)
      } else if (entry.isFile() && /\.(md|json)$/.test(entry.name)) {
        sources.push(readFileSync(fullPath, 'utf8'))
      }
    }
  }

  visit(sourceRoot)
  return sources
}

function listContentSourceFiles(relativePath: string): string[] {
  const sourceRoot = resolve(root, relativePath)
  const sources: string[] = []
  const visit = (dir: string) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const fullPath = resolve(dir, entry.name)
      if (entry.isDirectory()) {
        visit(fullPath)
      } else if (entry.isFile() && /\.(md|json)$/.test(entry.name)) {
        sources.push(fullPath)
      }
    }
  }

  visit(sourceRoot)
  return sources
}

function readPublicCopySources(relativePaths: string[]): string[] {
  const sources: string[] = []
  const visit = (dir: string) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const fullPath = resolve(dir, entry.name)
      if (entry.isDirectory()) {
        visit(fullPath)
      } else if (entry.isFile() && /\.(astro|md|tsx)$/.test(entry.name)) {
        sources.push(readFileSync(fullPath, 'utf8'))
      }
    }
  }

  for (const relativePath of relativePaths) {
    visit(resolve(workspaceRoot, relativePath))
  }

  return sources
}

function extractRelatedContentClusterBasePaths() {
  const source = readSource('components/RelatedContent.astro')
  const match = source.match(/const clusterBasePath:[\s\S]*?= \{([\s\S]*?)\n\}/)

  expect(match).not.toBeNull()

  return [...match![1].matchAll(/^\s*(?:'([^']+)'|([a-zA-Z][\w-]*)):\s*'([^']+)'/gm)].map(
    ([, quotedCluster, bareCluster, href]) => ({
      cluster: quotedCluster ?? bareCluster,
      href,
    }),
  )
}

describe('static marketing contracts', () => {
  it('does not expose draft legal placeholders in the public footer', () => {
    const footerLinks = footerLinkGroups.flatMap((group) => group.links)

    expect(footerLinks).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          href: internalPath.noticeOfPrivacyPractices,
        }),
      ]),
    )
  })

  it('submits selected lead magnet choices without requiring client-side JavaScript', () => {
    const source = readSource('components/LeadCapturePanel.astro')

    expect(source).toContain('name="magnetSlug"')
    expect(source).not.toContain('name={`lead-magnet-choice-${variant}`}')
  })

  it('builds marketing lead capture with the production app origin', () => {
    const wranglerConfig = readProjectSource('apps/marketing/wrangler.jsonc')
    const deployBuildScript = readProjectSource('apps/marketing/scripts/build-for-deploy.mjs')
    const leadPanel = readSource('components/LeadCapturePanel.astro')
    const newsletter = readSource('components/NewsletterSignup.astro')

    expect(wranglerConfig).toContain('"PUBLIC_APP_URL": "https://my.phiguard.app"')
    expect(deployBuildScript).toContain('PUBLIC_APP_URL')
    expect(`${leadPanel}\n${newsletter}`).not.toContain("?? 'http://localhost:3000'")
    expect(`${leadPanel}\n${newsletter}`).not.toContain('localhost:3000')
  })

  it('requires the public Turnstile site key for marketing deploy builds', () => {
    const deployBuildScript = readProjectSource('apps/marketing/scripts/build-for-deploy.mjs')
    const envExample = readProjectSource('.env.example')
    const runbook = readProjectSource('docs/runbooks/public-form-abuse-hardening.md')

    expect(deployBuildScript).toContain("'PUBLIC_TURNSTILE_SITE_KEY'")
    expect(deployBuildScript).toContain(
      'must be configured in wrangler.jsonc vars or the deploy environment',
    )
    expect(envExample).toContain('TURNSTILE_SECRET_KEY=')
    expect(envExample).toContain('PUBLIC_TURNSTILE_SITE_KEY=')
    expect(runbook).toContain('`PUBLIC_TURNSTILE_SITE_KEY`')
    expect(runbook).toContain('marketing deploy build fails if the public site key is missing')
  })

  it('requires the Turnstile server secret in central production runbooks', () => {
    const goLiveChecklist = readProjectSource('docs/runbooks/go-live-checklist.md')
    const goLiveSteps = readProjectSource('docs/runbooks/go-live-step-by-step.md')
    const cloudflareBootstrap = readProjectSource('docs/runbooks/cloudflare-bootstrap.md')

    expect(goLiveChecklist).toContain('BLOCKER: set `TURNSTILE_SECRET_KEY`')
    expect(goLiveSteps).toContain(
      'wrangler secret put TURNSTILE_SECRET_KEY --config wrangler.jsonc',
    )
    expect(cloudflareBootstrap).toContain(
      'wrangler secret put TURNSTILE_SECRET_KEY --config wrangler.jsonc',
    )
  })

  it('configures Sentry source-map uploads for marketing deploy builds', () => {
    const packageJson = readProjectSource('package.json')
    const marketingPackageJson = readProjectSource('apps/marketing/package.json')
    const astroConfig = readProjectSource('apps/marketing/astro.config.mjs')
    const goLiveSteps = readProjectSource('docs/runbooks/go-live-step-by-step.md')
    const goLiveChecklist = readProjectSource('docs/runbooks/go-live-checklist.md')
    const cloudflareBootstrap = readProjectSource('docs/runbooks/cloudflare-bootstrap.md')
    const envExample = readProjectSource('.env.example')

    expect(packageJson).toContain('"@sentry/vite-plugin"')
    expect(marketingPackageJson).toContain('"SENTRY_PROJECT": "phiguard-marketing"')
    expect(astroConfig).toContain("import { sentryVitePlugin } from '@sentry/vite-plugin'")
    expect(astroConfig).toContain('buildSentryVitePlugin')
    expect(astroConfig).toContain('SENTRY_AUTH_TOKEN')
    expect(astroConfig).toContain('hasSentryUploadConfig')
    expect(astroConfig).toContain('sourcemap: hasSentryUploadConfig()')
    expect(astroConfig).toContain('assets: [')
    expect(astroConfig).toContain('filesToDeleteAfterUpload')
    expect(goLiveSteps).toContain(
      'source map upload is configured for the web and marketing builds',
    )
    expect(goLiveSteps).toContain('SENTRY_AUTH_TOKEN')
    expect(goLiveSteps).toContain('SENTRY_ORG')
    expect(goLiveSteps).toContain('SENTRY_RELEASE')
    expect(goLiveSteps).toContain('delete generated `.map` files after Sentry upload')
    expect(goLiveChecklist).toContain('set `SENTRY_AUTH_TOKEN`')
    expect(goLiveChecklist).toContain('set `SENTRY_ORG`')
    expect(goLiveChecklist).toContain('set `SENTRY_RELEASE`')
    expect(cloudflareBootstrap).toContain('SENTRY_AUTH_TOKEN')
    expect(cloudflareBootstrap).toContain('SENTRY_ORG')
    expect(cloudflareBootstrap).toContain('SENTRY_RELEASE')
    expect(envExample).toContain('SENTRY_AUTH_TOKEN=')
    expect(envExample).toContain('SENTRY_ORG=')
    expect(envExample).toContain('SENTRY_RELEASE=')
    expect(goLiveSteps).not.toContain('source map upload is not configured yet')
  })

  it('allows the production app API and Cloudflare analytics in marketing CSP', () => {
    const headers = readProjectSource('apps/marketing/public/_headers')

    expect(headers).toMatch(/connect-src[^;\n]*https:\/\/my\.phiguard\.app/)
    expect(headers).toMatch(/connect-src[^;\n]*https:\/\/cloudflareinsights\.com/)
    expect(headers).toMatch(/connect-src[^;\n]*https:\/\/static\.cloudflareinsights\.com/)
    expect(headers).toMatch(/connect-src[^;\n]*https:\/\/widgets\.example\.com/)
    expect(headers).toMatch(
      /connect-src[^;\n]*https:\/\/ai-sdr-worker\.example\.workers\.dev/,
    )
    expect(headers).toMatch(/script-src[^;\n]*https:\/\/static\.cloudflareinsights\.com/)
    expect(headers).toMatch(/script-src[^;\n]*https:\/\/challenges\.cloudflare\.com/)
    expect(headers).toMatch(/script-src[^;\n]*https:\/\/widgets\.example\.com/)
    expect(headers).toMatch(
      /script-src[^;\n]*https:\/\/ai-sdr-worker\.example\.workers\.dev/,
    )
    expect(headers).toMatch(/form-action[^;\n]*https:\/\/my\.phiguard\.app/)
  })

  it('documents the marketing AI-SDR product-context secret', () => {
    const worker = readSource('worker.ts')
    const envExample = readProjectSource('.env.example')
    const cloudflareBootstrap = readProjectSource('docs/runbooks/cloudflare-bootstrap.md')
    const goLiveChecklist = readProjectSource('docs/runbooks/go-live-checklist.md')

    expect(worker).toContain('AI_SDR_CONTEXT_SECRET')
    expect(envExample).toContain('AI_SDR_CONTEXT_SECRET=')
    expect(cloudflareBootstrap).toContain('wrangler secret put AI_SDR_CONTEXT_SECRET')
    expect(goLiveChecklist).toContain('set `AI_SDR_CONTEXT_SECRET`')
  })

  it('allows Cloudflare Turnstile in marketing CSP', () => {
    const headers = readProjectSource('apps/marketing/public/_headers')

    expect(headers).toMatch(/script-src[^;\n]*https:\/\/challenges\.cloudflare\.com/)
    expect(headers).toMatch(/connect-src[^;\n]*https:\/\/challenges\.cloudflare\.com/)
    expect(headers).toMatch(/frame-src[^;\n]*https:\/\/challenges\.cloudflare\.com/)
  })

  it('does not ship draft legal README files from public assets', () => {
    expect(existsSync(resolve(workspaceRoot, 'apps/marketing/public/legal/README.txt'))).toBe(false)
    expect(existsSync(resolve(workspaceRoot, 'public/legal/README.txt'))).toBe(false)
  })

  it('renders exactly one visible primary unsubscribe heading in each state', () => {
    const source = readSource('pages/unsubscribe.astro')

    expect(source).toContain('<h1 class="utility-heading">Unsubscribe from PHIGuard emails</h1>')
    expect(source).toContain('<h2 class="utility-heading">You\'re unsubscribed.</h2>')
    expect(source).toContain('<h2 class="utility-heading">This link has expired.</h2>')
    expect(source.match(/<h1\b/g)).toHaveLength(1)
  })

  it('keeps unsubscribe bearer tokens away from shared marketing scripts', () => {
    const source = readSource('pages/unsubscribe.astro')
    const headers = readProjectSource('apps/marketing/public/_headers')
    const wranglerConfig = readProjectSource('apps/marketing/wrangler.jsonc')

    expect(source).not.toContain('MarketingLayout')
    expect(source).not.toContain('BaseLayout')
    expect(source).not.toContain('LeadMagnetPopup')
    expect(source).not.toContain('initMarketingAnalytics')
    expect(source).not.toContain('PUBLIC_POSTHOG_KEY')
    expect(source).not.toContain('ventora-ai-sdr')
    expect(source).toContain('<meta name="referrer" content="no-referrer" />')
    expect(source).toContain('window.history.replaceState(null, document.title, window.location.pathname)')
    expect(source).toContain("referrerPolicy: 'no-referrer'")
    expect(source).toContain('const appUrl = import.meta.env.PUBLIC_APP_URL ?? PHIGUARD_APP_ORIGIN')
    expect(source).not.toContain('localhost:3000')
    expect(wranglerConfig).toContain('"PUBLIC_APP_URL": "https://my.phiguard.app"')
    expect(headers).toMatch(/\/unsubscribe\r?\n\s+Referrer-Policy: no-referrer/)
    expect(headers).toMatch(/\/unsubscribe\/\*\r?\n\s+Referrer-Policy: no-referrer/)
  })

  it('does not promise no spam on newsletter capture copy', () => {
    const source = readSource('components/NewsletterSignup.astro')

    expect(source).toContain('Get practical HIPAA tips by email.')
    expect(source).not.toMatch(/email sequence|short sequence|follow-up sequence/i)
    expect(source).not.toMatch(/unsubscribe anytime/i)
    expect(source).not.toMatch(/no spam/i)
  })

  it('keeps newsletter capture attributed and accessible', () => {
    const source = readSource('components/NewsletterSignup.astro')

    expect(source).toContain('name="cta_context" value="newsletter-footer"')
    expect(source).toContain('name="source_page_path"')
    expect(source).toContain('name="referrer"')
    expect(source).toContain('role="status"')
    expect(source).toContain('aria-live="polite"')
    expect(source).toContain("setStatus('Check your inbox.', 'success')")
    expect(source).toContain(
      "setStatus('Could not subscribe right now. Please try again.', 'error')",
    )
    expect(source).toContain("params.get('error') === 'delivery-failed'")
  })

  it('surfaces lead delivery failures without check-your-inbox success copy', () => {
    const panel = readSource('components/LeadCapturePanel.astro')
    const newsletter = readSource('components/NewsletterSignup.astro')

    expect(panel).toContain("params.get('error') === 'delivery-failed'")
    expect(panel).toContain(
      "setStatus(\"We couldn't send the resource right now. Please try again.\", 'error')",
    )
    expect(panel).toContain(
      "setStatus('Check your inbox. The resource is on its way.', 'success')",
    )
    expect(newsletter).toContain("params.get('error') === 'delivery-failed'")
    expect(newsletter).toContain(
      "setStatus('Could not subscribe right now. Please try again.', 'error')",
    )
  })

  it('keeps partner application submissions accessible and recoverable', () => {
    const source = readSource('pages/partners.astro')

    expect(source).toContain("Astro.url.searchParams.get('applied') === '1'")
    expect(source).toContain("Astro.url.searchParams.has('error')")
    expect(source).toContain('role="status"')
    expect(source).toContain('aria-live="polite"')
    expect(source).toContain('data-partner-application-status')
    expect(source).toContain(
      "setStatus('Application received. We will review it and follow up by email.', 'success')",
    )
    expect(source).toContain(
      "setStatus('Could not submit the application. Please check the form and try again.', 'error')",
    )
  })

  it('uses clean resource-delivery copy in lead capture surfaces', () => {
    const popup = readSource('components/LeadMagnetPopup.astro')
    const panel = readSource('components/LeadCapturePanel.astro')
    const resource = readSource('pages/resources/[slug].astro')

    expect(popup).toContain('we will send it immediately')
    expect(popup).not.toMatch(/[Ãâ]/)
    expect(panel).toContain('We will send the resource to your inbox.')
    expect(resource).toContain('Enter your email and we will send the PDF.')
    expect(`${popup}\n${panel}\n${resource}`).not.toMatch(
      /email sequence|short sequence|follow-up sequence/i,
    )
    expect(`${popup}\n${panel}\n${resource}`).not.toMatch(/follow-?up emails?/i)
    expect(`${popup}\n${panel}\n${resource}`).not.toMatch(/unsubscribe anytime/i)
    expect(`${popup}\n${panel}\n${resource}`).not.toMatch(/no spam/i)
  })

  it('keeps banned email capture phrases out of public copy sources', () => {
    const content = readPublicCopySources([
      'apps/marketing/src/components',
      'apps/marketing/src/pages',
      'apps/marketing/src/content',
      'packages/email/src/templates',
    ]).join('\n')

    expect(content).not.toMatch(/email sequences?/i)
    expect(content).not.toMatch(/short sequence/i)
    expect(content).not.toMatch(/follow-?up sequence/i)
    expect(content).not.toMatch(/follow-?up emails?/i)
    expect(content).not.toMatch(/lead magnets?/i)
    expect(content).not.toMatch(/You.?ll also get/i)
    expect(content).not.toMatch(/no spam/i)
  })

  it('renders resource thank-you download hrefs server-side before inline JavaScript runs', () => {
    const source = readSource('pages/resources/thank-you.astro')

    expect(source).toContain('const downloadHref')
    expect(source).toContain('href={downloadHref}')
    expect(source).toContain('href={retryHref}')
    expect(source).not.toContain('id="ty-download-link" href="/resources"')
  })

  it('uses Angel Campa as the SEO content author with LinkedIn profile metadata', () => {
    const contributor = contributors['angel-campa']
    const articleSchema = buildArticleSchema({
      headline: 'HIPAA guide',
      description: 'A practical HIPAA guide for clinics.',
      url: '/learn/hipaa-guide',
      datePublished: '2026-01-01',
      reviewerName: contributors['phiguard-compliance-research'].name,
      reviewerUrl: 'https://phiguard.app/contributors/phiguard-compliance-research',
    }) as {
      author: { '@type': string; name: string; url: string; sameAs: string[] }
      reviewedBy: { '@type': string; name: string; url: string }
    }
    const personSchema = buildPersonSchema({
      name: contributor.name,
      description: contributor.bio,
      url: `/contributors/${contributor.slug}`,
      jobTitle: contributor.role,
      knowsAbout: contributor.expertise,
      sameAs: contributor.sameAs,
    }) as { sameAs: string[] }

    expect(contributor).toMatchObject({
      name: 'Angel Campa',
      role: 'Founder',
      sameAs: ['https://www.linkedin.com/in/angelcampa1/'],
    })
    expect(articleSchema.author).toEqual({
      '@type': 'Person',
      name: 'Angel Campa',
      url: 'https://phiguard.app/contributors/angel-campa',
      sameAs: ['https://www.linkedin.com/in/angelcampa1/'],
    })
    expect(articleSchema.reviewedBy).toEqual({
      '@type': 'Organization',
      name: 'PHIGuard Compliance Research',
      url: 'https://phiguard.app/contributors/phiguard-compliance-research',
    })
    expect(personSchema.sameAs).toEqual(['https://www.linkedin.com/in/angelcampa1/'])
  })

  it('does not use legacy team slugs as marketing content authors', () => {
    const content = readContentSources('content').join('\n')

    expect(content).not.toMatch(/^author:\s*"?phiguard-editorial-team"?$/m)
    expect(content).not.toMatch(/^author:\s*"?phiguard-product-team"?$/m)
    expect(content).not.toMatch(/"author":\s*"phiguard-editorial-team"/)
    expect(content).not.toMatch(/"author":\s*"phiguard-product-team"/)
  })

  it('keeps PHIGuard Compliance Research as the marketing content reviewer', () => {
    const content = readContentSources('content').join('\n')
    const markdownReviewerValues = [...content.matchAll(/^reviewer:\s*"?([^"\n]+)"?\s*$/gm)].map(
      (match) => match[1].trim(),
    )
    const jsonReviewerValues = [...content.matchAll(/"reviewer":\s*"([^"]+)"/g)].map((match) =>
      match[1].trim(),
    )
    const reviewerValues = [...markdownReviewerValues, ...jsonReviewerValues]

    expect(reviewerValues.length).toBeGreaterThan(0)
    expect(new Set(reviewerValues)).toEqual(new Set(['phiguard-compliance-research']))
  })

  it('keeps SEO progress notes aligned with current marketing commands and routes', () => {
    const seoProgress = readProjectSource('docs/marketing/seo-progress.md')
    const packageJson = readProjectSource('apps/marketing/package.json')

    expect(packageJson).toContain('"gen:og"')
    expect(seoProgress).toContain('pnpm --filter @phiguard/marketing gen:og')
    expect(seoProgress).toContain('/resources/best/<slug>')
    expect(seoProgress).not.toContain('pnpm gen:og')
    expect(seoProgress).not.toContain('content/pricing-breakdowns/')
    expect(seoProgress).not.toContain('there are no `[slug].astro`')
  })

  it('keeps reusable PHIGuard pricing boilerplate out of authored content', () => {
    const content = readContentSources('content').join('\n')

    expect(content).not.toContain(
      'PHIGuard uses flat per-clinic pricing with annual billing shown by default, no per-user fees, and a BAA included on every public plan.',
    )
    expect(content).not.toContain(
      'See [current PHIGuard pricing](/pricing) for plan names, monthly list prices, annual totals, and current launch details.',
    )
    expect(content).not.toMatch(
      /PHIGuard[^\r\n"]*(?:BAA included|includes a BAA|BAA is included|BAA at every|BAA coverage at every)/i,
    )
    expect(content).not.toMatch(
      /PHIGuard[^\r\n"]*(?:no per-user|flat per-clinic|per-clinic flat|flat monthly fee|flat per clinic|per-user pricing)/i,
    )
    expect(content).not.toMatch(
      /(?:BAA included|No per-user fees|flat per clinic|flat per-clinic|per-clinic flat-priced)/i,
    )
  })

  it('does not overstate PHIGuard as a recurring task scheduler in product claims', () => {
    const content = readContentSources('content').join('\n')
    const baaTrackerSource = readSource('content/best/best-baa-tracker-software.md')
    const googleDriveSource = readSource(
      'content/alternatives/google-drive-alternative-healthcare.md',
    )

    expect(content).not.toContain('Annual BAA reviews are scheduled as recurring compliance tasks')
    expect(content).not.toContain(
      'Recurring tasks — annual training cycles, quarterly access reviews, monthly security checks — are scheduled in the system',
    )
    expect(content).not.toContain('recurring compliance task scheduling')
    expect(content).not.toContain('recurring compliance schedule management')
    expect(content).not.toContain(
      'PHIGuard tracks the telehealth compliance program as a recurring compliance module',
    )
    expect(content).not.toContain('the BAA reassessment task is triggered automatically')
    expect(content).not.toContain('the review task is triggered automatically')
    expect(baaTrackerSource).not.toMatch(
      /Recurring review tasks|prompt this review on a recurring schedule/i,
    )
    expect(baaTrackerSource).not.toContain('assigned to a responsible staff member')
    expect(googleDriveSource).not.toContain('every compliance task has an assigned owner')
  })

  it('keeps canonical content copy tokens limited to resolved FAQ fields', () => {
    const token = '{{PHIGUARD_PRICING_DETAILS}}'
    const supportedCollections = [
      'alternatives',
      'best',
      'city-guides',
      'comparisons',
      'state-guides',
    ]
    const contentRoot = resolve(workspaceRoot, 'apps/marketing/src/content')
    const tokenFiles = listContentSourceFiles('content').filter((file) =>
      readFileSync(file, 'utf8').includes(token),
    )

    expect(tokenFiles.length).toBeGreaterThan(0)

    for (const file of tokenFiles) {
      const relativePath = relative(contentRoot, file).replace(/\\/g, '/')
      const collection = relativePath.split('/')[0]
      const source = readFileSync(file, 'utf8')

      expect(supportedCollections).toContain(collection)
      expect(source).toMatch(/"?a"?\s*:\s*"[^"]*\{\{PHIGUARD_PRICING_DETAILS\}\}/)
    }
  })

  it('centralizes winner positioning for comparison and alternative pages', () => {
    const productData = readProjectSource('packages/knowledge/src/marketing.ts')
    const productAdapter = readSource('data/product.ts')
    const winnerPanel = readSource('components/ComparisonWinnerPositioning.astro')
    const compareHub = readSource('pages/compare.astro')
    const comparisonPage = readSource('pages/compare/[slug].astro')
    const alternativePage = readSource('pages/alternatives/[slug].astro')

    expect(productData).toContain('comparisonWinnerPositioning')
    expect(productData).toContain('small clinics that need HIPAA operations')
    expect(productData).toContain('BAA every plan')
    expect(productData).toContain('audit history')
    expect(productData).toContain('per-clinic pricing')
    expect(productData).toContain('compliance tasks, incidents, vendors, and policies in one system')
    expect(productData).not.toMatch(/best for everyone|always wins|guaranteed/i)
    expect(productAdapter).toContain('@phiguard/knowledge/marketing')

    expect(winnerPanel).toContain('comparisonWinnerPositioning')
    expect(winnerPanel).toContain('const { variant =')

    expect(compareHub).toContain(
      "import ComparisonWinnerPositioning from '../components/ComparisonWinnerPositioning.astro'",
    )
    expect(compareHub).toContain('<ComparisonWinnerPositioning variant="hub" />')
    expect(comparisonPage).toContain(
      "import ComparisonWinnerPositioning from '../../components/ComparisonWinnerPositioning.astro'",
    )
    expect(comparisonPage).toContain(
      "const showWinnerPositioning = entrySlug.startsWith('phiguard-vs-')",
    )
    expect(comparisonPage).toContain(
      '{showWinnerPositioning && <ComparisonWinnerPositioning variant="comparison" />}',
    )
    expect(alternativePage).toContain(
      "import ComparisonWinnerPositioning from '../../components/ComparisonWinnerPositioning.astro'",
    )
    expect(alternativePage).toContain('<ComparisonWinnerPositioning variant="alternative" />')
  })

  it('keeps policy review resource copy aligned with current policy records', () => {
    const policyReviewCalendar = readProjectSource(
      'apps/marketing/src/content/resources/policy-review-calendar.md',
    )

    expect(policyReviewCalendar).not.toContain('recurring annual tasks')
    expect(policyReviewCalendar).not.toContain('linked to the policy version')
    expect(policyReviewCalendar).not.toContain('retained automatically for six years')
    expect(policyReviewCalendar).not.toContain('Policy version history is preserved')
    expect(policyReviewCalendar).not.toContain('Prior versions are not deleted')
  })

  it('keeps specialty practice pages from claiming unbuilt product modules', () => {
    const sleepMedicine = readProjectSource(
      'apps/marketing/src/content/practice-types/sleep-medicine-practice.md',
    )
    const urgentCare = readProjectSource(
      'apps/marketing/src/content/practice-types/urgent-care-practice.md',
    )

    expect(sleepMedicine).not.toContain('HST device tracking')
    expect(sleepMedicine).not.toContain('Each HST device is tracked')
    expect(sleepMedicine).not.toContain('CPAP adherence follow-up templates')
    expect(urgentCare).not.toContain('Shift handover checklists are templated')
    expect(urgentCare).not.toContain('documented sign-off')
    expect(urgentCare).not.toContain('EMR handoff tracking')
  })

  it('keeps the resources megamenu focused on hubs instead of individual spokes', () => {
    const hubPaths = new Set([
      internalPath.resources,
      internalPath.resourceTools,
      internalPath.learn,
      internalPath.learnPage('hipaa-basics/index'),
      internalPath.learnPage('phi-fundamentals/index'),
      internalPath.learnPage('phi-workflows/index'),
      internalPath.learnPage('phi-tools-vendors/index'),
      internalPath.guides,
      internalPath.best,
      internalPath.hipaaSoftware,
      internalPath.compare,
      '/alternatives',
      '/locations/hipaa-compliance',
      '/locations/hipaa-compliance-software',
      '/locations/hipaa-breach-notification',
      internalPath.practiceTypes,
      internalPath.glossary,
      internalPath.contributors,
    ])
    const menuLinks = resourcesMegaMenuGroups.flatMap((group) => [
      group.href ?? internalPath.resources,
      ...group.links.map((link) => link.href),
    ])

    expect(new Set(menuLinks)).toEqual(hubPaths)
    expect(menuLinks).not.toEqual(
      expect.arrayContaining([
        internalPath.resource('vendor-baa-tracker'),
        internalPath.guide('is-chatgpt-hipaa-compliant'),
        internalPath.bestPage('best-hipaa-project-management-tools'),
      ]),
    )
  })

  it('keeps generated hub pages attached to full collections', () => {
    const compareHub = readSource('pages/compare.astro')
    const resourcesHub = readSource('pages/resources/index.astro')
    const toolsHub = readSource('pages/resources/tools.astro')
    const alternativesHub = readSource('pages/alternatives/index.astro')
    const hipaaSoftwareHub = readSource('pages/hipaa-software/index.astro')

    expect(compareHub).toContain("getCollection('alternatives')")
    expect(compareHub).toContain("getCollection('practice-types')")
    expect(compareHub).not.toMatch(/alternativeCards[\s\S]*?\.slice\(/)
    expect(compareHub).not.toMatch(/practiceCards[\s\S]*?\.slice\(/)

    expect(resourcesHub).toContain("getCollection('resources')")
    expect(resourcesHub).toContain("getCollection('guides')")
    expect(resourcesHub).toContain("getCollection('best')")
    expect(resourcesHub).toContain("getCollection('hipaa-software')")
    expect(resourcesHub).toContain("getCollection('alternatives')")
    expect(resourcesHub).toContain("getCollection('comparisons')")
    expect(resourcesHub).toContain("getCollection('practice-types')")

    expect(toolsHub).toContain("getCollection('resources')")
    expect(alternativesHub).toContain("getCollection('alternatives')")
    expect(hipaaSoftwareHub).toContain('buildCollectionPageSchema')
  })

  it('keeps sitemap routes on the shared XML serializer with root alias coverage', () => {
    const sitemapSerializer = readSource('lib/sitemap.ts')
    const sitemapIndex = readSource('pages/sitemap-index.xml.ts')
    const sitemapRootAlias = readSource('pages/sitemap.xml.ts')
    const sitemapContent = readSource('pages/sitemap-content.xml.ts')
    const sitemapRootFiles = readSource('pages/sitemap-root-files.xml.ts')

    expect(sitemapSerializer).toContain('escapeXml')
    expect(sitemapSerializer).toContain('serializeSitemapIndex')
    expect(sitemapSerializer).toContain('serializeUrlSet')
    expect(sitemapIndex).toContain('serializeSitemapIndex')
    expect(sitemapContent).toContain('serializeUrlSet')
    expect(sitemapRootFiles).toContain('serializeUrlSet')
    expect(sitemapRootAlias).toContain(
      "import { GET as getSitemapIndex } from './sitemap-index.xml'",
    )
    expect(sitemapRootAlias).toContain('return getSitemapIndex()')
  })

  it('keeps SEO smoke lastmod parity coverage aligned with content sitemaps', () => {
    const smokeCheck = readProjectSource('apps/marketing/scripts/seo-smoke-check.mjs')

    expect(smokeCheck).toContain("assertSitemapLastmodMatchesUpdatedAt(sitemapEntries, 'learn'")
    expect(smokeCheck).toContain("assertSitemapLastmodMatchesUpdatedAt(sitemapEntries, 'guides'")
    expect(smokeCheck).toContain("assertSitemapLastmodMatchesUpdatedAt(sitemapEntries, 'best'")
    expect(smokeCheck).toContain(
      "assertSitemapLastmodMatchesUpdatedAt(sitemapEntries, 'hipaa-software'",
    )
    expect(smokeCheck).toContain('assertSitemapXmlAliasMatchesIndex()')
  })

  it('sets explicit canonicals on dynamic commercial routes', () => {
    const alternativePage = readSource('pages/alternatives/[slug].astro')
    const comparisonPage = readSource('pages/compare/[slug].astro')
    const practiceTypePage = readSource('pages/practice-types/[slug].astro')

    expect(alternativePage).toContain(
      'canonicalUrl={`${PHIGUARD_PUBLIC_SITE_ORIGIN}/alternatives/${entrySlug}`}',
    )
    expect(comparisonPage).toContain(
      'canonicalUrl={`${PHIGUARD_PUBLIC_SITE_ORIGIN}/compare/${entrySlug}`}',
    )
    expect(practiceTypePage).toContain(
      'canonicalUrl={`${PHIGUARD_PUBLIC_SITE_ORIGIN}/practice-types/${entrySlug}`}',
    )
  })

  it('keeps related content cluster base paths on generated marketing routes', () => {
    const generatedRouteBases = new Set([
      '/alternatives',
      '/compare',
      '/hipaa-software',
      '/locations/hipaa-compliance',
      '/locations/hipaa-compliance-software',
      '/practice-types',
      '/resources',
      '/resources/best',
      '/resources/guides',
    ])

    for (const { cluster, href } of extractRelatedContentClusterBasePaths()) {
      expect(generatedRouteBases, `${cluster} points to unsupported base path ${href}`).toContain(
        href,
      )
    }
  })

  it('keeps the reusable hero on the real product screenshot instead of fake preview UI', () => {
    const source = readSource('components/HeroSection.astro')

    expect(source).toContain("import { Image } from 'astro:assets'")
    expect(source).toContain("import dashboardImg from '../assets/product-dashboard.png'")
    expect(source).toContain('src={dashboardImg}')
    expect(source).toContain('PHIGuard dashboard showing compliance tasks')
    expect(source).not.toContain('showScreenshotPlaceholder')
    expect(source).not.toContain('Admin preview')
    expect(source).not.toContain('assurance-row')
    expect(source).not.toContain('Annual risk analysis 2025')
    expect(source).not.toContain('Due Mar 31')
  })

  it('keeps mobile cookie banner coverage deterministic', () => {
    const playwrightConfig = readProjectSource('apps/marketing/playwright.config.ts')
    const mobileChromeSpec = readProjectSource('apps/marketing/e2e/mobile/chrome.spec.ts')

    expect(playwrightConfig).toContain('PUBLIC_POSTHOG_KEY')
    expect(playwrightConfig).toContain('PUBLIC_APP_URL')
    expect(playwrightConfig).toContain('env: MARKETING_E2E_ENV')
    expect(playwrightConfig).toContain('pnpm exec astro build')
    expect(playwrightConfig).toContain('timeout: 120 * 1000')
    expect(mobileChromeSpec).not.toContain('test.skip()')
  })
})
