import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(scriptDir, '..')
const repoRoot = path.resolve(projectRoot, '..', '..')
const distRoot = path.join(projectRoot, 'dist')
const plansPath = path.join(repoRoot, 'packages', 'billing', 'src', 'plans.ts')
const publicPlans = ['essentials', 'clinic', 'group', 'compliance_ops']
const requiredAiSearchBots = [
  'OAI-SearchBot',
  'GPTBot',
  'ChatGPT-User',
  'OAI-AdsBot',
  'PerplexityBot',
  'Perplexity-User',
  'ClaudeBot',
  'Claude-User',
  'Claude-SearchBot',
  'Google-Extended',
  'Googlebot',
  'Bingbot',
]

const errors = []

function fail(message) {
  errors.push(message)
}

function readBuiltPage(sitePath) {
  const normalized = sitePath === '/' ? 'index.html' : `${sitePath.replace(/^\/+/, '')}/index.html`
  const filePath = path.join(distRoot, normalized)
  if (!fs.existsSync(filePath)) {
    fail(`Missing built page for ${sitePath}`)
    return ''
  }
  return fs.readFileSync(filePath, 'utf8')
}

function extractPublicPlans() {
  const source = fs.readFileSync(plansPath, 'utf8')

  return publicPlans.map((planId) => {
    const block = source.match(new RegExp(`${planId}:\\s*plan\\(\\{([\\s\\S]*?)\\}\\),`))?.[1]
    if (!block) {
      fail(`Unable to read public plan "${planId}" from packages/billing/src/plans.ts`)
      return null
    }

    const name = block.match(/\bname:\s*'([^']+)'/)
    const priceMonthly = block.match(/\bmonthly:\s*(\d+)/)
    const annual = block.match(/\bannual:\s*(\d+)/)
    const annualEffectiveMonthly = block.match(/\bannualEffectiveMonthly:\s*(\d+)/)
    const maxMembers = block.match(/\bmaxMembers:\s*(\d+)/)

    if (!name || !priceMonthly || !annual || !annualEffectiveMonthly || !maxMembers) {
      fail(`Unable to read public plan fields for "${planId}" from packages/billing/src/plans.ts`)
      return null
    }

    return {
      id: planId,
      name: name[1],
      priceMonthly: Number(priceMonthly[1]),
      priceAnnual: Number(annual[1]),
      priceAnnualMonthly: Number(annualEffectiveMonthly[1]),
      maxMembers: Number(maxMembers[1]),
    }
  }).filter(Boolean)
}

function assertPageFragments(sitePath, expectedFragments) {
  const html = readBuiltPage(sitePath)
  for (const fragment of expectedFragments) {
    if (!html.includes(fragment)) {
      fail(`${sitePath} missing expected extractable fragment: ${fragment}`)
    }
  }
}

function assertRootFile(fileName, expectedFragments) {
  const filePath = path.join(distRoot, fileName)
  if (!fs.existsSync(filePath)) {
    fail(`Missing ${fileName}`)
    return
  }

  const contents = fs.readFileSync(filePath, 'utf8')
  for (const fragment of expectedFragments) {
    if (!contents.includes(fragment)) {
      fail(`${fileName} missing expected fragment: ${fragment}`)
    }
  }
}

function assertRobotsAllowsAiSearchBots() {
  const robotsPath = path.join(distRoot, 'robots.txt')
  if (!fs.existsSync(robotsPath)) {
    fail('Missing robots.txt')
    return
  }

  const robots = fs.readFileSync(robotsPath, 'utf8')
  for (const bot of requiredAiSearchBots) {
    const allowRule = new RegExp(`User-agent:\\s*${bot}\\s+Allow:\\s*/`, 'i')
    if (!allowRule.test(robots)) {
      fail(`robots.txt missing explicit allow rule for ${bot}`)
    }
  }
}

function assertRootFilesAreSitemapDiscoverable() {
  const sitemapFiles = ['sitemap-content.xml', 'sitemap-root-files.xml']
  const sitemapXml = sitemapFiles
    .map((fileName) => {
      const filePath = path.join(distRoot, fileName)
      return fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : ''
    })
    .join('\n')

  for (const fileName of ['llms.txt', 'pricing.txt']) {
    const loc = `https://phiguard.app/${fileName}`
    if (!sitemapXml.includes(`<loc>${loc}</loc>`)) {
      fail(`${fileName} is not discoverable from sitemap output`)
    }
  }
}

function assertPricingConsistency() {
  const plans = extractPublicPlans()
  const pricingText = fs.readFileSync(path.join(distRoot, 'pricing.txt'), 'utf8')
  const pricingHtml = readBuiltPage('/pricing')
  const homepageHtml = readBuiltPage('/')
  const homepageSchemas = extractJsonLd(homepageHtml, '/')
  const homepageSoftwareSchema = homepageSchemas.find((schema) => schema?.['@type'] === 'SoftwareApplication')
  const homepageOffers = Array.isArray(homepageSoftwareSchema?.offers)
    ? homepageSoftwareSchema.offers
    : []

  for (const plan of plans) {
    const discountedAnnual = plan.priceAnnual / 2
    const discountedAnnualMonthly = plan.priceAnnualMonthly / 2
    const discountedMonthly = plan.priceMonthly / 2
    const formatUsd = (amount) => `$${Number.isInteger(amount) ? amount.toFixed(0) : amount.toFixed(2)}`
    const expectedPricingText = [
      `## ${plan.name}`,
      `Annual price after LAUNCH50: ${formatUsd(discountedAnnual)}/year per clinic (${formatUsd(discountedAnnualMonthly)}/month equivalent, paid upfront annually)`,
      `Annual list price: $${plan.priceAnnual}/year per clinic ($${plan.priceAnnualMonthly}/month equivalent, paid upfront annually)`,
      `Monthly price after LAUNCH50: ${formatUsd(discountedMonthly)}/month per clinic, paid monthly`,
      `Monthly list price: $${plan.priceMonthly}/month per clinic, paid monthly`,
      `User limit: Up to ${plan.maxMembers} staff`,
    ]

    for (const fragment of expectedPricingText) {
      if (!pricingText.includes(fragment)) {
        fail(`pricing.txt missing shared plan fragment for ${plan.id}: ${fragment}`)
      }
    }

    for (const [label, html] of [
      ['/', homepageHtml],
      ['/pricing', pricingHtml],
    ]) {
      if (!html.includes(`$${plan.priceMonthly}`)) {
        fail(`${label} missing monthly price for ${plan.id}: $${plan.priceMonthly}`)
      }
      if (!html.includes(`$${plan.priceAnnualMonthly}`)) {
        fail(`${label} missing annual monthly price for ${plan.id}: $${plan.priceAnnualMonthly}`)
      }
      if (!html.includes(`$${plan.priceAnnual}`)) {
        fail(`${label} missing annual total for ${plan.id}: $${plan.priceAnnual}`)
      }
      if (!html.includes(`Up to ${plan.maxMembers} staff`)) {
        fail(`${label} missing member limit for ${plan.id}: Up to ${plan.maxMembers} staff`)
      }
    }

    for (const [cadence, amount, duration] of [
      ['annual', discountedAnnual, 'P1Y'],
      ['monthly', discountedMonthly, 'P1M'],
    ]) {
      const schemaAmount = amount.toFixed(2)
      const hasOffer = homepageOffers.some((offer) => (
        offer?.name === `${plan.name} (${cadence})`
        && offer.price === schemaAmount
        && offer.priceSpecification?.price === schemaAmount
        && offer.priceSpecification?.billingDuration === duration
      ))

      if (!hasOffer) {
        fail(`homepage SoftwareApplication schema missing ${cadence} LAUNCH50 offer for ${plan.id}: ${schemaAmount} ${duration}`)
      }
    }
  }
}

function extractJsonLd(html, sitePath) {
  const schemas = []
  for (const [, body] of html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      const parsed = JSON.parse(body)
      schemas.push(...(Array.isArray(parsed) ? parsed : [parsed]))
    } catch (error) {
      fail(`${sitePath}: JSON-LD block is not valid JSON (${error.message})`)
    }
  }

  return schemas
}

function assertJsonLdType(sitePath, expectedType, alternates = []) {
  const html = readBuiltPage(sitePath)
  const acceptedTypes = [expectedType, ...alternates]
  const matched = acceptedTypes.some((type) =>
    html.includes(`"@type":"${type}"`) || html.includes(`"@type": "${type}"`)
  )

  if (!matched) {
    fail(`${sitePath} missing JSON-LD type ${acceptedTypes.join(' or ')}`)
  }
}

function assertJsonLdAbsent(sitePath, forbiddenType) {
  const html = readBuiltPage(sitePath)
  if (html.includes(`"@type":"${forbiddenType}"`) || html.includes(`"@type": "${forbiddenType}"`)) {
    fail(`${sitePath} should not include JSON-LD type ${forbiddenType}`)
  }
}

assertRootFile('llms.txt', [
  'PHIGuard',
  '/product',
  '/pricing',
  '/learn',
  '/resources/guides',
  '/resources/best',
  '/compare',
  '/learn/hipaa-basics/what-is-phi',
])
assertRootFile('pricing.txt', [
  'Essentials',
  'Clinic Starter',
  'Group',
  'Compliance Ops',
  'LAUNCH50',
  '50% off forever',
  'Limited-time offer',
  '30-day money-back guarantee',
  'BAA included: Yes',
  'Free trial: 30 days',
  'Credit card required: No',
  'Canonical pricing page: https://phiguard.app/pricing',
])
assertRobotsAllowsAiSearchBots()
assertRootFilesAreSitemapDiscoverable()
assertPricingConsistency()

assertJsonLdType('/', 'SoftwareApplication')
assertJsonLdType('/', 'FAQPage')
assertJsonLdType('/pricing', 'SoftwareApplication')
assertJsonLdType('/pricing', 'FAQPage')
assertJsonLdType('/product', 'SoftwareApplication')
assertJsonLdType('/hipaa', 'FAQPage')
assertJsonLdType('/learn', 'CollectionPage')
assertJsonLdType('/learn/hipaa-basics/what-is-phi', 'DefinedTerm')
assertJsonLdType('/learn/phi-workflows/phi-in-ai-tools', 'HowTo')
assertJsonLdType('/learn/phi-fundamentals', 'CollectionPage')
assertJsonLdAbsent('/learn/phi-fundamentals', 'BlogPosting')
assertJsonLdType('/resources', 'CollectionPage')
assertJsonLdType('/resources/guides', 'CollectionPage')
assertJsonLdType('/resources/guides/google-drive', 'Article', ['BlogPosting'])
assertJsonLdType('/resources/best', 'CollectionPage')
assertJsonLdType('/resources/best/best-phi-management-software', 'ItemList')
assertJsonLdType('/alternatives/asana-alternative', 'Article', ['BlogPosting'])
assertJsonLdType('/compare', 'CollectionPage')
assertJsonLdType('/compare/phiguard-vs-generic-phi-workflow-stack', 'Article', ['BlogPosting'])
assertJsonLdType('/practice-types/dental-practice', 'Article', ['BlogPosting'])
assertJsonLdType('/hipaa-software/medical-offices', 'Article', ['BlogPosting'])
assertJsonLdType('/locations/hipaa-compliance', 'CollectionPage')
assertJsonLdType('/locations/hipaa-compliance/new-york-ny', 'Article', ['BlogPosting'])
assertJsonLdType('/locations/hipaa-compliance/los-angeles-ca', 'Article', ['BlogPosting'])
assertJsonLdType('/locations/hipaa-compliance/houston-tx', 'Article', ['BlogPosting'])
assertJsonLdType('/locations/hipaa-compliance/denver-co', 'Article', ['BlogPosting'])
assertJsonLdType('/locations/hipaa-compliance-software', 'CollectionPage')
assertJsonLdType('/locations/hipaa-breach-notification', 'CollectionPage')
assertJsonLdType('/locations/hipaa-compliance-software/california', 'Article', ['BlogPosting'])
assertJsonLdType('/locations/hipaa-breach-notification/texas', 'Article', ['BlogPosting'])
assertJsonLdType('/contributors/angel-campa', 'Person')
assertJsonLdType('/glossary', 'CollectionPage')

assertPageFragments('/learn/hipaa-basics/what-is-phi', ['Short answer'])
assertPageFragments('/resources/best/best-phi-management-software', ['Decision summary'])
assertPageFragments('/alternatives/asana-alternative', ['Short answer'])
assertPageFragments('/practice-types/dental-practice', ['Practice summary'])
assertPageFragments('/hipaa-software/medical-offices', ['What matters for this use case'])
assertPageFragments('/locations/hipaa-compliance/new-york-ny', ['Short answer'])
assertPageFragments('/locations/hipaa-compliance/los-angeles-ca', ['multilingual access'])
assertPageFragments('/locations/hipaa-compliance/houston-tx', ['continuity planning'])
assertPageFragments('/locations/hipaa-compliance/denver-co', ['Colorado Privacy Act'])
assertPageFragments('/locations/hipaa-compliance-software/california', ['CMIA overlays'])
assertPageFragments('/locations/hipaa-breach-notification/texas', ['HB 300 overlays'])

if (errors.length > 0) {
  console.error('AEO smoke check failed:')
  for (const error of errors) {
    console.error(`- ${error}`)
  }
  process.exit(1)
}

console.log('AEO smoke check passed.')
