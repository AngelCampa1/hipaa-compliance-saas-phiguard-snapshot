import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(scriptDir, '..')
const repoRoot = path.resolve(projectRoot, '..', '..')
const distRoot = path.join(projectRoot, 'dist')
const plansPath = path.join(repoRoot, 'packages', 'billing', 'src', 'plans.ts')
const pricingTablePath = path.join(projectRoot, 'src', 'components', 'PricingTable.astro')
const signupOrigin = 'https://my.phiguard.app/signup'
const publicPlans = ['essentials', 'clinic', 'group', 'compliance_ops']
const checkedPages = [
  { label: '/', path: 'index.html' },
  { label: '/pricing', path: path.join('pricing', 'index.html') },
  { label: '/product', path: path.join('product', 'index.html') },
]
const planNameCheckedPages = checkedPages.filter((page) => page.label === '/pricing' || page.label === '/product')
const staleSourceRoots = [
  path.join(projectRoot, 'src'),
  path.join(projectRoot, 'public', 'pricing.txt'),
  path.join(projectRoot, 'public', 'llms.txt'),
  path.join(repoRoot, 'packages', 'billing', 'src'),
  path.join(repoRoot, 'apps', 'web', 'src', 'lib'),
  path.join(repoRoot, 'apps', 'web', 'src', 'routes', 'app', 'billing.tsx'),
  path.join(repoRoot, 'packages', 'lead-magnets', 'src'),
  path.join(repoRoot, 'packages', 'email', 'src'),
  path.join(repoRoot, 'packages', 'pdf', 'src'),
  path.join(repoRoot, 'docs', 'roadmap.md'),
  path.join(repoRoot, 'docs', 'runbooks'),
  path.join(repoRoot, 'docs', 'soc2', 'README.md'),
]
const stalePricingChecks = [
  {
    label: 'old three-plan list',
    pattern: /Essentials, Clinic, and Group/,
  },
  {
    label: 'old PHIGuard starts-at price',
    pattern: /PHIGuard[^\n]{0,180}(?:starts?|from|at|runs|flat pricing|pricing|is)[^\n]{0,100}\$99/i,
  },
  {
    label: 'old PHIGuard dollar amount before product context',
    pattern: /\$99(?![\d.])(?:\/month|\/clinic\/mo|\s*per clinic per month|\s*per month|\s*\/mo)?[^\n]{0,180}(?:PHIGuard|Essentials|Clinic plan|Group plan|BAA included|no per-user fees)/i,
  },
  {
    label: 'old Essentials price',
    pattern: /Essentials(?:\*\*)?(?:\s+plan|\s+tier)?[^\n]{0,120}\$99(?:\/month|\/clinic\/mo|\s*per clinic per month|\s*per month|\s*\/mo)?/i,
  },
  {
    label: 'old generic PHIGuard starts-at price',
    pattern: /(?:Pricing|Plans)\s+starts?\s+at\s+\$99\/mo(?:nth)?[^\n]{0,120}(?:PHIGuard|BAA|clinic)/i,
  },
  {
    label: 'old three-price PHIGuard tiers',
    pattern: /(?:PHIGuard|per-clinic|per clinic|pricing|Pricing model|BAA included|Essentials|Clinic|Group)[^\n]{0,160}\$99\s*(?:\/|,|\s+\/\s+)[^\n]{0,80}\$249\s*(?:\/|,|,?\s+or\s+)[^\n]{0,80}\$499/i,
  },
  {
    label: 'old Clinic price',
    pattern: /(?:PHIGuard|Clinic|plan|tier|flat pricing|pricing)[^\n]{0,120}\$249(?:\/month|\/clinic\/mo|\s*per clinic per month|\s*per month|\s*\/mo)?|\$249(?:\/month|\/clinic\/mo|\s*per clinic per month|\s*per month|\s*\/mo)?[^\n]{0,120}(?:PHIGuard|Clinic|plan|tier|flat pricing|pricing)/i,
  },
  {
    label: 'old Group price',
    pattern: /(?:PHIGuard|Group|plan|tier|flat pricing|pricing)[^\n]{0,120}\$499(?:\/month|\/clinic\/mo|\s*per clinic per month|\s*per month|\s*\/mo)?|\$499(?:\/month|\/clinic\/mo|\s*per clinic per month|\s*per month|\s*\/mo)?[^\n]{0,120}(?:PHIGuard|Group|plan|tier|flat pricing|pricing)/i,
  },
  {
    label: 'old Group included baseline',
    pattern: /Everything in Clinic(?! Starter)/,
  },
  {
    label: 'old first-year promotion copy',
    pattern: /(?:LAUNCH|promo|offer|discount)[^\n]{0,120}first[-\s]year|first[-\s]year[^\n]{0,120}(?:LAUNCH|promo|offer|discount)/i,
  },
]

const errors = []

function fail(message) {
  errors.push(message)
}

function readBuiltPage(page) {
  const filePath = path.join(distRoot, page.path)
  if (!fs.existsSync(filePath)) {
    fail(`${page.label}: built HTML file is missing`)
    return ''
  }

  return fs.readFileSync(filePath, 'utf8')
}

function extractPublicPlanNames() {
  const source = fs.readFileSync(plansPath, 'utf8')

  return publicPlans.map((planId) => {
    const block = source.match(new RegExp(`${planId}:\\s*plan\\(\\{([\\s\\S]*?)\\}\\),`))?.[1]
    const name = block?.match(/\bname:\s*'([^']+)'/)?.[1]

    if (!name) {
      fail(`Unable to read public plan name for "${planId}" from packages/billing/src/plans.ts`)
      return null
    }

    return name
  }).filter(Boolean)
}

function collectSourceFiles(entryPath) {
  if (!fs.existsSync(entryPath)) {
    return []
  }

  const stat = fs.statSync(entryPath)
  if (stat.isFile()) {
    return [entryPath]
  }

  const ignoredDirectories = new Set(['dist', 'seo-audit', 'raw', 'node_modules', '.astro'])
  return fs.readdirSync(entryPath, { withFileTypes: true }).flatMap((entry) => {
    const childPath = path.join(entryPath, entry.name)

    if (entry.isDirectory()) {
      return ignoredDirectories.has(entry.name) ? [] : collectSourceFiles(childPath)
    }

    if (!entry.isFile()) {
      return []
    }

    return /\.(astro|md|mdx|ts|tsx|js|mjs|json|txt)$/.test(entry.name) ? [childPath] : []
  })
}

const publicPlanNames = extractPublicPlanNames()
const publicPlanList = `${publicPlanNames.slice(0, -1).join(', ')}, and ${publicPlanNames.at(-1)}`

for (const page of checkedPages) {
  const html = readBuiltPage(page)
  const signupPlanMatches = [
    ...html.matchAll(/https:\/\/my\.phiguard\.app\/signup\?plan=([a-z_-]+)/g),
  ]
  const linkedPlans = signupPlanMatches.map((match) => match[1])

  for (const plan of publicPlans) {
    const expectedHref = `${signupOrigin}?plan=${plan}`
    if (!html.includes(expectedHref)) {
      fail(`${page.label}: missing expected public plan CTA ${expectedHref}`)
    }
  }

  for (const plan of linkedPlans) {
    if (!publicPlans.includes(plan)) {
      fail(`${page.label}: unsupported public signup plan "${plan}"`)
    }
  }

  const pricingCtas = [...html.matchAll(/<a\b[^>]*data-ph-pricing-cta="([^"]+)"[^>]*>/g)]
  for (const match of pricingCtas) {
    const anchor = match[0]
    const planName = match[1]

    for (const attribute of [
      'data-ph-pricing-price',
      'data-ph-pricing-list-price',
      'data-ph-pricing-annual-price',
      'data-ph-pricing-annual-list-price',
      'data-ph-pricing-monthly-price',
      'data-ph-pricing-monthly-list-price',
    ]) {
      const value = anchor.match(new RegExp(`${attribute}="([^"]+)"`))?.[1]

      if (!value) {
        fail(`${page.label}: ${planName} pricing CTA missing ${attribute}`)
        continue
      }

      if (!Number.isFinite(Number(value))) {
        fail(`${page.label}: ${planName} pricing CTA has non-numeric ${attribute}: ${value}`)
      }
    }
  }

}

const pricingTableSource = fs.readFileSync(pricingTablePath, 'utf8')
if (
  !pricingTableSource.includes('data-ph-pricing-${period}-price')
  || !pricingTableSource.includes("a.setAttribute('data-ph-pricing-price', price)")
  || !pricingTableSource.includes("a.setAttribute('data-ph-pricing-list-price', listPrice)")
) {
  fail('PricingTable: pricing toggle script does not update CTA analytics prices for the selected billing period')
}

for (const page of planNameCheckedPages) {
  const html = readBuiltPage(page)

  for (const planName of publicPlanNames) {
    if (!html.includes(planName)) {
      fail(`${page.label}: missing public plan name "${planName}"`)
    }
  }

  if (!html.includes(publicPlanList)) {
    fail(`${page.label}: missing catalog-derived public plan list "${publicPlanList}"`)
  }
}

const staleSourceCheckedPaths = [...new Set(staleSourceRoots.flatMap(collectSourceFiles))]

for (const filePath of staleSourceCheckedPaths) {
  const source = fs.readFileSync(filePath, 'utf8')
  const relativePath = path.relative(projectRoot, filePath)

  for (const check of stalePricingChecks) {
    const match = source.match(check.pattern)
    if (match) {
      fail(`${relativePath}: stale ${check.label} copy found: ${match[0]}`)
    }
  }
}

if (errors.length > 0) {
  console.error('Plan CTA smoke check failed:')
  for (const error of errors) {
    console.error(`- ${error}`)
  }
  process.exit(1)
}

console.log('Plan CTA smoke check passed.')
