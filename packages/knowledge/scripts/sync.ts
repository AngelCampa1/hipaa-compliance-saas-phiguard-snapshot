import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { generateKnowledgeBundle, renderKnowledgeTextArtifact } from '../src/index.js'

const distDir = join(import.meta.dirname, '..', 'dist', 'ai')
const marketingPublicDir = join(import.meta.dirname, '..', '..', '..', 'apps', 'marketing', 'public')

mkdirSync(distDir, { recursive: true })

for (const domain of ['marketing', 'app', 'public', 'emails', 'marketing-infra', 'all'] as const) {
  writeFileSync(
    join(distDir, `${domain}.json`),
    `${JSON.stringify(generateKnowledgeBundle(domain), null, 2)}\n`,
  )
}

writeFileSync(join(marketingPublicDir, 'llms.txt'), renderKnowledgeTextArtifact('llms.txt'))
writeFileSync(join(marketingPublicDir, 'pricing.txt'), renderKnowledgeTextArtifact('pricing.txt'))
