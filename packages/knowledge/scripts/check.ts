import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import {
  generateKnowledgeBundle,
  renderKnowledgeTextArtifact,
  validateKnowledgeItems,
  allKnowledgeItems,
} from '../src/index.js'

const validationErrors = validateKnowledgeItems(allKnowledgeItems)
if (validationErrors.length > 0) {
  process.stderr.write(`${validationErrors.join('\n')}\n`)
  process.exit(1)
}

const distDir = join(import.meta.dirname, '..', 'dist', 'ai')

for (const domain of ['marketing', 'app', 'public', 'emails', 'marketing-infra', 'all'] as const) {
  const file = join(distDir, `${domain}.json`)
  if (!existsSync(file)) {
    process.stderr.write(`Missing generated knowledge artifact: ${file}\n`)
    process.exit(1)
  }

  const actual = JSON.parse(readFileSync(file, 'utf8'))
  const expected = generateKnowledgeBundle(domain)

  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    process.stderr.write(`Generated knowledge artifact is stale: ${file}\n`)
    process.exit(1)
  }
}

const marketingPublicDir = join(import.meta.dirname, '..', '..', '..', 'apps', 'marketing', 'public')
for (const artifact of ['llms.txt', 'pricing.txt'] as const) {
  const file = join(marketingPublicDir, artifact)
  if (!existsSync(file)) {
    process.stderr.write(`Missing generated knowledge artifact: ${file}\n`)
    process.exit(1)
  }

  const actual = readFileSync(file, 'utf8')
  const expected = renderKnowledgeTextArtifact(artifact)
  if (actual !== expected) {
    process.stderr.write(`Generated knowledge artifact is stale: ${file}\n`)
    process.exit(1)
  }
}
