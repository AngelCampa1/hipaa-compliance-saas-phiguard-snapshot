import { execFileSync, spawnSync } from 'node:child_process'
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { test } from 'node:test'
import assert from 'node:assert/strict'

const scriptPath = resolve('scripts/deploy-touched.mjs')

function git(cwd, args) {
  execFileSync('git', args, { cwd, stdio: 'pipe' })
}

function makeRepo() {
  const cwd = mkdtempSync(join(tmpdir(), 'phiguard-deploy-touched-'))
  git(cwd, ['init'])
  git(cwd, ['config', 'user.email', 'test@example.com'])
  git(cwd, ['config', 'user.name', 'Test User'])
  writeFileSync(join(cwd, 'README.md'), 'initial\n')
  git(cwd, ['add', '.'])
  git(cwd, ['commit', '-m', 'initial'])
  return cwd
}

function dryRunForChangedFile(file) {
  const cwd = makeRepo()
  const fullPath = join(cwd, ...file.split('/'))
  mkdirSync(dirname(fullPath), { recursive: true })
  writeFileSync(fullPath, 'changed\n')
  git(cwd, ['add', '.'])
  git(cwd, ['commit', '-m', `change ${file}`])

  return execFileSync(process.execPath, [scriptPath, '--dry-run'], {
    cwd,
    encoding: 'utf8',
  })
}

test('deploy:touched selects marketing and pdfs for package changes that affect public artifacts', () => {
  assert.match(dryRunForChangedFile('packages/brand/src/colors.ts'), /Deploy targets: marketing, pdfs/)
  assert.match(dryRunForChangedFile('packages/knowledge/src/app.ts'), /Deploy targets: web, marketing/)
  assert.match(dryRunForChangedFile('packages/marketing-db/src/server.ts'), /Deploy targets: web/)
  assert.match(dryRunForChangedFile('packages/billing/src/plans.ts'), /Deploy targets: web, pdfs/)
  assert.match(dryRunForChangedFile('packages/baa/src/service.ts'), /Deploy targets: web, pdfs/)
  assert.match(dryRunForChangedFile('packages/ui/src/pdf-tokens.ts'), /Deploy targets: web, pdfs/)
})

test('deploy:touched treats --since as a git ref argument, not shell input', () => {
  const cwd = makeRepo()
  const injectionMarker = 'PHIGUARD_DEPLOY_INJECTION_TEST'
  const result = spawnSync(
    process.execPath,
    [scriptPath, '--dry-run', `--since=HEAD; echo ${injectionMarker}`],
    {
      cwd,
      encoding: 'utf8',
    },
  )
  const output = `${result.stdout ?? ''}${result.stderr ?? ''}`

  assert.notEqual(result.status, 0)
  assert.match(output, /Invalid --since git ref/)
  assert.doesNotMatch(output, new RegExp(`^${injectionMarker}$`, 'm'))
})
