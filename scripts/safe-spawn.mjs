import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { isAbsolute, join, resolve } from 'node:path'

const nativeWindowsCommands = new Set(['docker', 'git', 'node'])
const windowsNodeEntrypoints = {
  playwright: [
    ['node_modules', '@playwright', 'test', 'cli.js'],
    ['..', '..', 'node_modules', '@playwright', 'test', 'cli.js'],
  ],
  pnpm: [[process.env.APPDATA ?? '', 'npm', 'node_modules', 'pnpm', 'bin', 'pnpm.cjs']],
  postiz: [[process.env.APPDATA ?? '', 'npm', 'node_modules', 'postiz', 'dist', 'index.js']],
  wrangler: [
    ['node_modules', 'wrangler', 'bin', 'wrangler.js'],
    [process.env.APPDATA ?? '', 'npm', 'node_modules', 'wrangler', 'bin', 'wrangler.js'],
  ],
}

function resolveCandidate(baseDir, parts) {
  const [firstPart = '', ...remainingParts] = parts
  const candidate = resolve(
    firstPart && isAbsolute(firstPart)
      ? join(firstPart, ...remainingParts)
      : firstPart
        ? join(baseDir, firstPart, ...remainingParts)
        : join(...parts),
  )
  return existsSync(candidate) ? candidate : null
}

function commandForPlatform(command, args, options) {
  if (process.platform !== 'win32') return { command, args }

  const normalizedCommand = command.toLowerCase()
  if (nativeWindowsCommands.has(normalizedCommand) || /[\\/]/.test(command) || /\.[a-z0-9]+$/i.test(command)) {
    return { command, args }
  }

  const cwd = options.cwd ? resolve(String(options.cwd)) : process.cwd()
  for (const parts of windowsNodeEntrypoints[normalizedCommand] ?? []) {
    const candidate = resolveCandidate(cwd, parts)
    if (candidate) {
      return { command: process.execPath, args: [candidate, ...args] }
    }
  }

  return { command, args }
}

export function safeSpawnSync(command, args = [], options = {}) {
  const resolved = commandForPlatform(command, args, options)

  return spawnSync(resolved.command, resolved.args, {
    ...options,
    shell: false,
  })
}
