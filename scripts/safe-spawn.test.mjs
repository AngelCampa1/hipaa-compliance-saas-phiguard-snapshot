import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { safeSpawnSync } from './safe-spawn.mjs'
import test from 'node:test'

test('security-sensitive scripts do not run argv through a shell', () => {
  const scripts = [
    'apps/marketing/scripts/build-for-deploy.mjs',
    'apps/web/scripts/playwright-direct-uploads.mjs',
    'apps/web/scripts/vite-build.mjs',
    'scripts/cleanup-old-cloudflare-pages.mjs',
    'scripts/deploy-touched.mjs',
    'scripts/schedule-postiz-linkedin.mjs',
  ]

  for (const file of scripts) {
    const source = readFileSync(file, 'utf8')
    assert.doesNotMatch(source, /shell:\s*(?:true|process\.platform\s*===\s*['"]win32['"])/)
    assert.match(source, /safeSpawnSync/)
  }
})

test('safeSpawnSync forces shell execution off', () => {
  const source = readFileSync('scripts/safe-spawn.mjs', 'utf8')

  assert.match(source, /shell:\s*false/)
})

test('Postiz CLI live operations are disabled on Windows', () => {
  const source = readFileSync('scripts/schedule-postiz-linkedin.mjs', 'utf8')

  assert.match(source, /process\.platform === 'win32' && transport === 'cli' && \(execute \|\| syncExisting\)/)
  assert.match(source, /Use --transport api/)
})

test('safeSpawnSync launches Windows package-manager shims without a shell', { skip: process.platform !== 'win32' }, () => {
  const pnpm = safeSpawnSync('pnpm', ['--version'], { encoding: 'utf8' })
  assert.equal(pnpm.error, undefined)
  assert.equal(pnpm.status, 0)
  assert.match(pnpm.stdout, /^\d+\.\d+\.\d+/)

  const wrangler = safeSpawnSync('wrangler', ['--version'], { encoding: 'utf8' })
  assert.equal(wrangler.error, undefined)
  assert.equal(wrangler.status, 0)
  assert.match(wrangler.stdout, /^\d+\.\d+\.\d+/)

  const playwright = safeSpawnSync('playwright', ['--version'], {
    cwd: join(process.cwd(), 'apps', 'web'),
    encoding: 'utf8',
  })
  assert.equal(playwright.error, undefined)
  assert.equal(playwright.status, 0)
  assert.match(playwright.stdout, /^Version \d+\.\d+\.\d+/)
})
