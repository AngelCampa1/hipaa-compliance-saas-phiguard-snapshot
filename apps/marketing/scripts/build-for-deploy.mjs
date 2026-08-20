import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { safeSpawnSync } from '../../../scripts/safe-spawn.mjs'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(scriptDir, '..')
const wranglerConfig = fs.readFileSync(path.join(projectRoot, 'wrangler.jsonc'), 'utf8')
const publicVars = [...wranglerConfig.matchAll(/"(PUBLIC_[A-Z0-9_]+)"\s*:\s*"([^"]+)"/g)]
const requiredPublicVars = ['PUBLIC_POSTHOG_KEY', 'PUBLIC_APP_URL', 'PUBLIC_CAPTCHA_SITE_KEY', 'PUBLIC_TURNSTILE_SITE_KEY']

const env = { ...process.env }
for (const [, key, value] of publicVars) {
  if (!env[key] && value) {
    env[key] = value
  }
}

for (const key of requiredPublicVars) {
  if (!env[key]) {
    console.error(`${key} must be configured in wrangler.jsonc vars or the deploy environment`)
    process.exit(1)
  }
}

function printResultOutput(result) {
  if (result.stdout) process.stdout.write(result.stdout)
  if (result.stderr) process.stderr.write(result.stderr)
}

function runBuild() {
  const result = safeSpawnSync('pnpm', ['build'], {
    cwd: projectRoot,
    env,
    encoding: 'utf8',
    stdio: 'pipe',
  })
  printResultOutput(result)
  return result
}

function createMissingContentAssetShim(output) {
  const match = output.match(/Cannot find module '([^']+[\\/]content-assets_[^']+\.mjs)'/)
  if (!match) return false

  const missingPath = path.resolve(match[1])
  const distChunksDir = path.join(projectRoot, 'dist', 'chunks')
  if (!missingPath.startsWith(distChunksDir + path.sep)) return false

  fs.mkdirSync(path.dirname(missingPath), { recursive: true })
  fs.writeFileSync(missingPath, 'export default new Map();\n')
  console.warn(`Created empty Astro content asset map shim: ${path.relative(projectRoot, missingPath)}`)
  return true
}

let result = runBuild()

if ((result.status ?? 1) !== 0) {
  const combinedOutput = `${result.stdout ?? ''}\n${result.stderr ?? ''}`
  if (createMissingContentAssetShim(combinedOutput)) {
    result = runBuild()
  }
}

if (result.error) {
  console.error(result.error.message)
  process.exit(1)
}

process.exit(result.status ?? 1)
