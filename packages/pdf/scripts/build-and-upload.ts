import { createHash } from 'node:crypto'
import { execFileSync, spawnSync } from 'node:child_process'
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join, resolve } from 'node:path'
import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'
import { LEAD_MAGNET_MANIFEST, renderDocumentToBuffer } from '../src/index.js'
import { shouldTreatExistingR2PdfAsVerified } from '../src/upload-verification.js'

interface Result {
  slug: string
  sizeBytes: number
  hashPrefix: string
  status: 'uploaded' | 'verified' | 'local' | 'error'
  error?: string
}

const require = createRequire(import.meta.url)
const wranglerCliPath = require.resolve('wrangler/bin/wrangler.js')
const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../../..')
const LIVE_VERIFY_TIMEOUT_MS = 30_000

function getLeadMagnetsBucketName() {
  if (process.env.R2_LEAD_MAGNETS_BUCKET) {
    return process.env.R2_LEAD_MAGNETS_BUCKET
  }

  const wranglerConfig = readFileSync(join(repoRoot, 'wrangler.jsonc'), 'utf8')
  const match = wranglerConfig.match(/"R2_LEAD_MAGNETS_BUCKET"\s*:\s*"([^"]+)"/)
  return match?.[1] ?? ''
}

function getConfiguredAppUrl() {
  if (process.env.APP_URL) {
    return process.env.APP_URL.replace(/\/+$/, '')
  }

  const wranglerConfig = readFileSync(join(repoRoot, 'wrangler.jsonc'), 'utf8')
  const match = wranglerConfig.match(/"APP_URL"\s*:\s*"([^"]+)"/)
  return match?.[1]?.replace(/\/+$/, '') ?? ''
}

function uploadToR2(bucket: string, key: string, filePath: string) {
  const result = spawnSync(
    process.execPath,
    [
      wranglerCliPath,
      'r2',
      'object',
      'put',
      `${bucket}/${key}`,
      '--file',
      filePath,
      '--remote',
      '--force',
      '--content-type',
      'application/pdf',
      '--content-disposition',
      `attachment; filename="${key.split('/').at(-1) ?? 'document.pdf'}"`,
    ],
    {
      cwd: process.cwd(),
      encoding: 'utf8',
      // 'ignore' on stdin gives wrangler an immediate EOF so it never blocks
      // waiting for interactive input, which hangs the process on Windows.
      stdio: ['ignore', 'pipe', 'pipe'],
    },
  )

  const output = (result.stdout ?? '') + (result.stderr ?? '')

  if (result.status !== 0) {
    throw new Error(`wrangler r2 put failed (exit ${result.status}): ${output.trim()}`)
  }

  if (!output.includes('Upload complete.')) {
    throw new Error(`wrangler r2 put exited 0 but did not confirm upload - output: ${output.trim()}`)
  }
}

function downloadFromR2(bucket: string, key: string, filePath: string) {
  execFileSync(
    process.execPath,
    [
      wranglerCliPath,
      'r2',
      'object',
      'get',
      `${bucket}/${key}`,
      '--file',
      filePath,
      '--remote',
    ],
    {
      cwd: process.cwd(),
      stdio: 'pipe',
    },
  )
}

function assertPdfBuffer(buffer: Buffer, slug: string) {
  if (buffer.length < 5_000) {
    throw new Error(`${slug} rendered PDF is unexpectedly small`)
  }

  if (!buffer.subarray(0, 5).equals(Buffer.from('%PDF-'))) {
    throw new Error(`${slug} rendered output is not a PDF`)
  }
}

function sleep(ms: number) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms)
}

function verifyUploadedObject(input: {
  bucket: string
  key: string
  filePath: string
  expectedHash: string
  expectedSize: number
  slug: string
}) {
  let lastHash = ''
  let lastSize = 0

  for (let attempt = 1; attempt <= 5; attempt++) {
    const verifiedBuffer = downloadUploadedPdf({
      bucket: input.bucket,
      key: input.key,
      filePath: input.filePath,
      slug: input.slug,
    })
    lastSize = verifiedBuffer.length
    lastHash = createHash('sha256').update(verifiedBuffer).digest('hex')

    if (lastSize === input.expectedSize && lastHash === input.expectedHash) {
      return
    }

    if (attempt < 5) {
      sleep(1_000)
    }
  }

  throw new Error(
    `uploaded object did not match rendered PDF (expected ${input.expectedSize} bytes/${input.expectedHash.slice(
      0,
      12,
    )}, got ${lastSize} bytes/${lastHash.slice(0, 12)})`,
  )
}

function downloadUploadedPdf(input: {
  bucket: string
  key: string
  filePath: string
  slug: string
}) {
  const appUrl = getConfiguredAppUrl()
  if (appUrl) {
    const response = fetchSync(`${appUrl}/api/marketing/lead-magnets/${encodeURIComponent(input.slug)}`)
    if (!response.ok) {
      throw new Error(`live PDF verification failed for ${input.slug}: ${response.status}`)
    }

    return response.body
  }

  downloadFromR2(input.bucket, input.key, input.filePath)
  return readFileSync(input.filePath)
}

function fetchSync(url: string) {
  const result = spawnSync(
    process.execPath,
    [
      '--input-type=module',
      '--eval',
      `
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), ${LIVE_VERIFY_TIMEOUT_MS});
        try {
          const response = await fetch(${JSON.stringify(url)}, { signal: controller.signal });
          const body = Buffer.from(await response.arrayBuffer());
          process.stdout.write(JSON.stringify({
            ok: response.ok,
            status: response.status,
            body: body.toString('base64'),
          }));
        } finally {
          clearTimeout(timeout);
        }
      `,
    ],
    {
      cwd: process.cwd(),
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
      timeout: LIVE_VERIFY_TIMEOUT_MS + 5_000,
    },
  )

  if (result.status !== 0) {
    const reason = result.error?.message ?? result.stderr.trim()
    throw new Error(`live PDF verification request failed: ${reason}`)
  }

  const parsed = JSON.parse(result.stdout) as {
    ok: boolean
    status: number
    body: string
  }

  return {
    ok: parsed.ok,
    status: parsed.status,
    body: Buffer.from(parsed.body, 'base64'),
  }
}

async function main() {
  const localOnly = process.env.PDF_LOCAL_ONLY === 'true'
  const forceUpload = process.env.PDF_FORCE_UPLOAD === 'true'
  const skipHashVerify = process.env.PDF_SKIP_HASH_VERIFY === 'true'
  const results: Result[] = []
  const distDir = join(process.cwd(), 'dist')
  const verifyDir = mkdtempSync(join(tmpdir(), 'phiguard-pdf-verify-'))
  mkdirSync(distDir, { recursive: true })

  const bucket = localOnly ? '' : getLeadMagnetsBucketName()
  if (!localOnly && !bucket) {
    throw new Error('Missing R2 env - set R2_LEAD_MAGNETS_BUCKET')
  }

  for (const entry of LEAD_MAGNET_MANIFEST) {
    const outputPath = join(distDir, `${entry.slug}.pdf`)

    try {
      const buffer = await renderDocumentToBuffer(entry.render())
      assertPdfBuffer(buffer, entry.slug)
      const hash = createHash('sha256').update(buffer).digest('hex')
      writeFileSync(outputPath, buffer)

      if (localOnly) {
        results.push({
          slug: entry.slug,
          sizeBytes: buffer.length,
          hashPrefix: hash.slice(0, 12),
          status: 'local',
        })
        continue
      }

      const verifyPath = join(verifyDir, `${entry.slug}.pdf`)
      if (!forceUpload) {
        try {
          downloadFromR2(bucket, entry.storageKey, verifyPath)
          const existingBuffer = readFileSync(verifyPath)
          assertPdfBuffer(existingBuffer, entry.slug)
          const existingHash = createHash('sha256').update(existingBuffer).digest('hex')
          if (
            shouldTreatExistingR2PdfAsVerified({
              rendered: { sizeBytes: buffer.length, sha256: hash },
              existing: { sizeBytes: existingBuffer.length, sha256: existingHash },
            })
          ) {
            if (!skipHashVerify) {
              verifyUploadedObject({
                bucket,
                key: entry.storageKey,
                filePath: verifyPath,
                expectedHash: hash,
                expectedSize: buffer.length,
                slug: entry.slug,
              })
            }
            results.push({
              slug: entry.slug,
              sizeBytes: existingBuffer.length,
              hashPrefix: existingHash.slice(0, 12),
              status: 'verified',
            })
            continue
          }
        } catch {
          rmSync(verifyPath, { force: true })
        }
      }

      uploadToR2(bucket, entry.storageKey, outputPath)
      if (skipHashVerify) {
        downloadFromR2(bucket, entry.storageKey, verifyPath)
        const verifiedBuffer = readFileSync(verifyPath)
        assertPdfBuffer(verifiedBuffer, entry.slug)
      } else {
        verifyUploadedObject({
          bucket,
          key: entry.storageKey,
          filePath: verifyPath,
          expectedHash: hash,
          expectedSize: buffer.length,
          slug: entry.slug,
        })
      }
      results.push({
        slug: entry.slug,
        sizeBytes: buffer.length,
        hashPrefix: hash.slice(0, 12),
        status: 'uploaded',
      })
    } catch (err) {
      results.push({
        slug: entry.slug,
        sizeBytes: 0,
        hashPrefix: '',
        status: 'error',
        error: err instanceof Error ? err.message : String(err),
      })
    } finally {
      if (!localOnly) {
        rmSync(outputPath, { force: true })
      }
    }
  }

  rmSync(verifyDir, { recursive: true, force: true })

  console.log('\nLead magnet PDF build summary:')
  console.log('-'.repeat(80))
  for (const result of results) {
    const kb = (result.sizeBytes / 1024).toFixed(1).padStart(7)
    console.log(
      `${result.slug.padEnd(32)} ${kb} KB  ${result.hashPrefix.padEnd(14)} ${result.status}${
        result.error ? `  (${result.error})` : ''
      }`,
    )
  }

  const errorCount = results.filter((result) => result.status === 'error').length
  if (errorCount > 0) {
    console.error(`\n${errorCount} PDFs failed`)
    process.exit(1)
  }

  const successLabel = localOnly
    ? 'written to packages/pdf/dist/'
    : results.some((result) => result.status === 'uploaded')
      ? 'uploaded and verified in R2'
      : 'verified in R2'
  console.log(`\n${results.length} PDFs ${successLabel}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
