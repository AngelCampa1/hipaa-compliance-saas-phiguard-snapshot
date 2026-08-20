/**
 * DataForSEO Competitor Keyword Gap Analysis
 *
 * Finds keywords ranked by HIPAA compliance competitors that phiguard.app
 * does not yet rank for in the top 20. Clusters results by topic and writes
 * a ranked opportunity list to scripts/content-opportunities.json.
 *
 * Run: pnpm tsx scripts/keyword-research.ts
 * Requires: DATAFORSEO_LOGIN and DATAFORSEO_PASSWORD in environment
 */

import { writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const DATAFORSEO_LOGIN = process.env.DATAFORSEO_LOGIN
const DATAFORSEO_PASSWORD = process.env.DATAFORSEO_PASSWORD

if (!DATAFORSEO_LOGIN || !DATAFORSEO_PASSWORD) {
  console.error('Missing DATAFORSEO_LOGIN or DATAFORSEO_PASSWORD in environment')
  process.exit(1)
}

const AUTH = Buffer.from(`${DATAFORSEO_LOGIN}:${DATAFORSEO_PASSWORD}`).toString('base64')

const COMPETITORS = [
  'compliancygroup.com',
  'accountable-hq.com',
  'abyde.com',
  'totalhipaa.com',
  'medtrainer.com',
]

const OUR_DOMAIN = 'phiguard.app'

const TOPIC_CLUSTERS: Record<string, RegExp[]> = {
  'state-law': [/\b(california|texas|new york|florida|illinois|washington|colorado|virginia|connecticut|minnesota|massachusetts|ohio|michigan|georgia|pennsylvania|new jersey|tennessee|indiana|wisconsin|north carolina|arizona)\b/i, /\b(cmia|hb 300|shield act|cdpa|ctdpa|hra|hipaa state)\b/i],
  'glossary': [/\b(what is|definition|meaning|defined|means|stand for)\b/i, /\b(phi|hipaa|baa|business associate|covered entity|ePHI|breach|safeguards|clearinghouse)\b.*\b(definition|defined|means|what is)\b/i],
  'role-specific': [/\b(for nurses|for doctors|for medical assistants|for front desk|for receptionists|for it staff|for billing|for coders|for scribes|for volunteers|for interns|for practice managers)\b/i],
  'phi-workflow': [/\b(phi in|phi and|protecting phi|handling phi|phi handling)\b/i, /\b(ehr|lab results|prior authorization|care coordination|patient portal|genetic|remote monitoring|handoff)\b.*\b(hipaa|phi|compliant)\b/i],
  'ai-tools': [/\b(claude|perplexity|deepseek|github copilot|cursor|anthropic|epic ehr|athenahealth|oracle health|practice fusion|cerner)\b.*\b(hipaa|compliant|compliance)\b/i, /\bai tool.*hipaa\b/i],
  'best-of': [/\best\b.*\b(hipaa|ehr|compliant)\b/i, /\b(hipaa compliant alternatives|hipaa alternatives)\b/i],
}

interface KeywordResult {
  keyword: string
  volume: number
  difficulty: number
  intent: string
  cluster: string
  competitor: string
}

async function dfseoPost(endpoint: string, data: object[]): Promise<unknown> {
  const res = await fetch(`https://api.dataforseo.com/v3/${endpoint}`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${AUTH}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    throw new Error(`DataForSEO ${endpoint} failed: ${res.status} ${res.statusText}`)
  }
  return res.json()
}

function detectCluster(keyword: string): string {
  for (const [cluster, patterns] of Object.entries(TOPIC_CLUSTERS)) {
    for (const pattern of patterns) {
      if (pattern.test(keyword)) return cluster
    }
  }
  return 'general'
}

async function getCompetitorKeywords(domain: string): Promise<KeywordResult[]> {
  console.log(`  Fetching keywords for ${domain}...`)
  const response = await dfseoPost('dataforseo_labs/google/domain_keywords_for_site/live', [
    {
      target: domain,
      language_code: 'en',
      location_code: 2840, // United States
      filters: [
        ['keyword_data.keyword_info.search_volume', '>', 50],
        ['ranked_serp_element.serp_item.rank_group', '<', 21],
      ],
      order_by: ['keyword_data.keyword_info.search_volume,desc'],
      limit: 500,
    },
  ]) as { tasks?: Array<{ result?: Array<{ items?: Array<{ keyword_data: { keyword: string; keyword_info: { search_volume: number }; keyword_properties: { keyword_difficulty: number; intent: { main: string } } }; ranked_serp_element: { serp_item: { rank_group: number } } }> }> }> }

  const items = response?.tasks?.[0]?.result?.[0]?.items ?? []
  return items.map((item) => ({
    keyword: item.keyword_data.keyword,
    volume: item.keyword_data.keyword_info.search_volume,
    difficulty: item.keyword_data.keyword_properties?.keyword_difficulty ?? 50,
    intent: item.keyword_data.keyword_properties?.intent?.main ?? 'informational',
    cluster: detectCluster(item.keyword_data.keyword),
    competitor: domain,
  }))
}

async function getOurRankings(): Promise<Set<string>> {
  console.log(`  Fetching our current rankings for ${OUR_DOMAIN}...`)
  const response = await dfseoPost('dataforseo_labs/google/domain_keywords_for_site/live', [
    {
      target: OUR_DOMAIN,
      language_code: 'en',
      location_code: 2840,
      filters: [['ranked_serp_element.serp_item.rank_group', '<', 21]],
      limit: 1000,
    },
  ]) as { tasks?: Array<{ result?: Array<{ items?: Array<{ keyword_data: { keyword: string } }> }> }> }

  const items = response?.tasks?.[0]?.result?.[0]?.items ?? []
  return new Set(items.map((item) => item.keyword_data.keyword.toLowerCase()))
}

async function main() {
  console.log('PHIGuard Keyword Gap Analysis\n')

  let ourRankings: Set<string>
  try {
    ourRankings = await getOurRankings()
    console.log(`  Found ${ourRankings.size} keywords we already rank for\n`)
  } catch (err) {
    console.warn('  Could not fetch our rankings, proceeding without gap filter:', err)
    ourRankings = new Set()
  }

  const allCompetitorKeywords: KeywordResult[] = []
  for (const competitor of COMPETITORS) {
    try {
      const keywords = await getCompetitorKeywords(competitor)
      allCompetitorKeywords.push(...keywords)
      console.log(`  ${competitor}: ${keywords.length} keywords`)
    } catch (err) {
      console.warn(`  ${competitor}: error - ${err}`)
    }
  }

  // Deduplicate by keyword, keep highest volume
  const keywordMap = new Map<string, KeywordResult>()
  for (const kw of allCompetitorKeywords) {
    const key = kw.keyword.toLowerCase()
    const existing = keywordMap.get(key)
    if (!existing || kw.volume > existing.volume) {
      keywordMap.set(key, kw)
    }
  }

  // Filter: not already ranking, KD ≤ 45
  const gaps = Array.from(keywordMap.values())
    .filter((kw) => !ourRankings.has(kw.keyword.toLowerCase()))
    .filter((kw) => kw.difficulty <= 45)
    .sort((a, b) => b.volume - a.volume)

  // Cluster summary
  const clusterCounts: Record<string, number> = {}
  for (const kw of gaps) {
    clusterCounts[kw.cluster] = (clusterCounts[kw.cluster] ?? 0) + 1
  }

  console.log('\n=== Gap Analysis Results ===')
  console.log(`Total gap opportunities: ${gaps.length}`)
  console.log('\nBy cluster:')
  for (const [cluster, count] of Object.entries(clusterCounts).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${cluster}: ${count}`)
  }

  const output = {
    generatedAt: new Date().toISOString(),
    totalGaps: gaps.length,
    clusters: clusterCounts,
    topOpportunities: gaps.slice(0, 200),
  }

  const outPath = join(__dirname, 'content-opportunities.json')
  writeFileSync(outPath, JSON.stringify(output, null, 2))
  console.log(`\nWrote ${gaps.length} opportunities to ${outPath}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
