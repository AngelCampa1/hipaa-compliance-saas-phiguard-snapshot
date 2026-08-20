import { execFileSync, spawn } from 'node:child_process'
import { existsSync, mkdirSync, openSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { PLAYWRIGHT_AUTH_SECRET, PLAYWRIGHT_DATABASE_URL } from './test-env'

const __dirname = dirname(fileURLToPath(import.meta.url))
const appRoot = join(__dirname, '..')
const logDir = join(appRoot, '.playwright-runtime')
const pidFile = join(logDir, 'playwright-preview.pid')
const stdoutLog = join(logDir, 'playwright-preview.stdout.log')
const stderrLog = join(logDir, 'playwright-preview.stderr.log')
const appUrl = process.env.PLAYWRIGHT_APP_URL ?? 'http://127.0.0.1:3210'
const previewReadyUrl = new URL('/signup', appUrl).toString()
const port = String(new URL(appUrl).port || '3210')
const playwrightServerScript = join(appRoot, 'scripts', 'playwright-preview-server.mjs')
const tsxCli = join(appRoot, 'node_modules', 'tsx', 'dist', 'cli.mjs')
const directUploadsEnabled = process.env.PLAYWRIGHT_DIRECT_UPLOADS === 'true'

function ensureLogDir() {
  if (!existsSync(logDir)) {
    mkdirSync(logDir, { recursive: true })
  }
}

function killPid(pid: number) {
  try {
    if (process.platform === 'win32') {
      execFileSync('taskkill', ['/PID', String(pid), '/T', '/F'], { stdio: 'ignore' })
      return
    }

    process.kill(-pid, 'SIGTERM')
  } catch {
    // Ignore teardown cleanup failures. The next run will recreate the environment.
  }
}

function readProcessCommandLine(pid: number) {
  try {
    if (process.platform === 'win32') {
      return execFileSync(
        'powershell',
        [
          '-NoProfile',
          '-Command',
          `(Get-CimInstance Win32_Process -Filter "ProcessId = ${pid}").CommandLine`,
        ],
        { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] },
      )
    }

    return execFileSync('ps', ['-p', String(pid), '-o', 'command='], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    })
  } catch {
    return ''
  }
}

function isPreviewServerProcess(pid: number) {
  const commandLine = readProcessCommandLine(pid).toLowerCase()
  const scriptName = 'playwright-preview-server.mjs'
  const normalizedScriptPath = playwrightServerScript.toLowerCase().replaceAll('\\', '/')
  const normalizedCommandLine = commandLine.replaceAll('\\', '/')

  return (
    normalizedCommandLine.includes(scriptName) ||
    normalizedCommandLine.includes(normalizedScriptPath)
  )
}

async function waitForPreviewServer(timeoutMs = 180_000) {
  const deadline = Date.now() + timeoutMs
  let lastError: unknown

  while (Date.now() < deadline) {
    try {
      const response = await fetch(previewReadyUrl, {
        redirect: 'manual',
      })

      if (response.ok || [301, 302, 303, 307, 308].includes(response.status)) {
        return
      }

      lastError = new Error(`Preview server returned HTTP ${response.status}`)
    } catch (error) {
      lastError = error
    }

    await new Promise((resolve) => setTimeout(resolve, 1_000))
  }

  const stderr = existsSync(stderrLog) ? readFileSync(stderrLog, 'utf8') : ''
  const stdout = existsSync(stdoutLog) ? readFileSync(stdoutLog, 'utf8') : ''
  const cause =
    lastError instanceof Error ? lastError.message : 'Preview server did not become ready'

  throw new Error(
    `Preview server did not become ready within ${timeoutMs}ms.\nCause: ${cause}\nSTDOUT:\n${stdout}\nSTDERR:\n${stderr}`,
  )
}

export async function startPreviewServer() {
  ensureLogDir()
  stopPreviewServer()
  const stdoutFd = openSync(stdoutLog, 'w')
  const stderrFd = openSync(stderrLog, 'w')
  const command = process.execPath
  const args = directUploadsEnabled
    ? [tsxCli, playwrightServerScript]
    : [playwrightServerScript]

  const child = spawn(command, args, {
    cwd: appRoot,
    detached: true,
    env: {
      ...process.env,
      APP_URL: appUrl,
      ATTACHMENT_SCAN_REQUEST_SECRET:
        process.env.ATTACHMENT_SCAN_REQUEST_SECRET ?? 'playwright-scan-request-secret',
      ATTACHMENT_SCAN_REQUEST_URL:
        process.env.ATTACHMENT_SCAN_REQUEST_URL ?? `${appUrl}/__playwright/attachment-scan`,
      ATTACHMENT_SCAN_WEBHOOK_SECRET:
        process.env.ATTACHMENT_SCAN_WEBHOOK_SECRET ?? 'playwright-scan-webhook-secret',
      BETTER_AUTH_SECRET:
        process.env.BETTER_AUTH_SECRET ?? PLAYWRIGHT_AUTH_SECRET,
      BETTER_AUTH_URL: appUrl,
      DATABASE_URL: process.env.DATABASE_URL ?? PLAYWRIGHT_DATABASE_URL,
      DATABASE_SSL: 'false',
      DIRECT_UPLOAD_SECRET:
        process.env.DIRECT_UPLOAD_SECRET ?? 'playwright-direct-upload-secret',
      DISABLE_RATE_LIMIT: 'true',
      ENABLE_MOCK_UPLOADS: directUploadsEnabled ? 'false' : 'true',
      NODE_ENV: 'production',
      PLAYWRIGHT: 'true',
      PLAYWRIGHT_APP_URL: appUrl,
      PORT: port,
      ATTACHMENTS_BUCKET_NAME: directUploadsEnabled ? 'playwright-attachments' : '',
    },
    stdio: ['ignore', stdoutFd, stderrFd],
    windowsHide: true,
  })

  writeFileSync(pidFile, String(child.pid))
  child.unref()

  await waitForPreviewServer()
}

export function stopPreviewServer() {
  if (!existsSync(pidFile)) {
    return
  }

  const pid = Number(readFileSync(pidFile, 'utf8'))

  if (!Number.isFinite(pid)) {
    unlinkSync(pidFile)
    return
  }

  try {
    if (isPreviewServerProcess(pid)) {
      killPid(pid)
    }
  } catch {
    // Ignore teardown cleanup failures. The next run will recreate the environment.
  } finally {
    if (existsSync(pidFile)) {
      unlinkSync(pidFile)
    }
  }
}
