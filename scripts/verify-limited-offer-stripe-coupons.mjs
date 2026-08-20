#!/usr/bin/env node
import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..')
const tsxCommand = path.join(
  repoRoot,
  'node_modules',
  '.bin',
  process.platform === 'win32' ? 'tsx.cmd' : 'tsx',
)
const command = process.platform === 'win32' ? 'cmd.exe' : tsxCommand
const args = process.platform === 'win32'
  ? ['/c', tsxCommand, path.join(repoRoot, 'scripts', 'verify-limited-offer-stripe-coupons.ts'), ...process.argv.slice(2)]
  : [path.join(repoRoot, 'scripts', 'verify-limited-offer-stripe-coupons.ts'), ...process.argv.slice(2)]
const result = spawnSync(
  command,
  args,
  {
    cwd: repoRoot,
    env: process.env,
    stdio: 'inherit',
  },
)

if (result.error) {
  console.error(result.error.message)
  process.exit(1)
}

process.exit(result.status ?? 1)
