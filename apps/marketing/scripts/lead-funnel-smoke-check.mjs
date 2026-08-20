import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(scriptDir, '..')
const distRoot = path.join(projectRoot, 'dist')

const checks = [
  { path: 'index.html', needle: 'data-lead-conversion="inline"', label: '/' },
  { path: 'index.html', needle: 'data-lead-popup', label: '/' },
  { path: path.join('pricing', 'index.html'), needle: 'data-lead-conversion="inline"', label: '/pricing' },
  { path: path.join('pricing', 'index.html'), needle: 'data-lead-popup', label: '/pricing' },
  { path: path.join('learn', 'risk-analysis', 'how-to-do-a-hipaa-risk-analysis', 'index.html'), needle: 'data-lead-conversion="sidebar"', label: '/learn/risk-analysis/how-to-do-a-hipaa-risk-analysis' },
  { path: path.join('learn', 'risk-analysis', 'how-to-do-a-hipaa-risk-analysis', 'index.html'), needle: 'data-lead-popup', label: '/learn/risk-analysis/how-to-do-a-hipaa-risk-analysis' },
  { path: path.join('compare', 'hipaa-compliance-software-comparison', 'index.html'), needle: 'data-lead-conversion="inline"', label: '/compare/hipaa-compliance-software-comparison' },
  { path: path.join('compare', 'hipaa-compliance-software-comparison', 'index.html'), needle: 'data-lead-popup', label: '/compare/hipaa-compliance-software-comparison' },
  { path: path.join('privacy', 'index.html'), needle: 'data-lead-popup', label: '/privacy', absent: true },
  { path: path.join('resources', 'baa-template', 'index.html'), needle: 'data-lead-popup', label: '/resources/baa-template', absent: true },
  { path: 'index.html', needle: 'lead-capture:success', label: '/ popup closes only after successful capture' },
]

const errors = []

for (const check of checks) {
  const filePath = path.join(distRoot, check.path)
  const html = fs.readFileSync(filePath, 'utf8')
  const hasNeedle = html.includes(check.needle)

  if (check.absent ? hasNeedle : !hasNeedle) {
    errors.push(`${check.label}: expected ${check.absent ? 'not to find' : 'to find'} "${check.needle}"`)
  }
}

if (errors.length > 0) {
  console.error('Lead funnel smoke check failed:')
  for (const error of errors) {
    console.error(`- ${error}`)
  }
  process.exit(1)
}

console.log('Lead funnel smoke check passed.')
