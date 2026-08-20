import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { createRequire } from 'node:module'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { LEAD_MAGNETS } from '@phiguard/lead-magnets'
import { LEAD_MAGNET_MANIFEST } from '@phiguard/pdf'
import { getLeadMagnetObject } from '../src/lib/s3.js'

const marketingBaseUrl = (process.env.MARKETING_SITE_URL ?? '').replace(/\/+$/, '')
const appBaseUrl = (process.env.APP_URL ?? '').replace(/\/+$/, '')
const require = createRequire(import.meta.url)
const wranglerCliPath = require.resolve('wrangler/bin/wrangler.js')

if (!marketingBaseUrl || !appBaseUrl) {
  throw new Error('MARKETING_SITE_URL and APP_URL must be set before running lead magnet verification.')
}

const manifestBySlug = new Map(LEAD_MAGNET_MANIFEST.map((entry) => [entry.slug, entry]))

async function getVerifiedLeadMagnetObject(bucket: string, key: string) {
  try {
    return await getLeadMagnetObject(key)
  } catch (err) {
    if (!bucket) {
      throw err
    }
  }

  if (!bucket) {
    return null
  }

  const verifyDir = mkdtempSync(join(tmpdir(), 'phiguard-lead-magnet-verify-'))
  const filePath = join(verifyDir, key.split('/').at(-1) ?? 'lead-magnet.pdf')

  try {
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

    const bytes = readFileSync(filePath)
    if (!bytes.subarray(0, 5).equals(Buffer.from('%PDF-'))) {
      throw new Error(`R2 object is not a PDF: ${key}`)
    }

    return {
      body: new Blob([bytes]).stream(),
      httpMetadata: {
        contentType: 'application/pdf',
      },
    }
  } catch (err) {
    if (err instanceof Error && err.message.startsWith('R2 object is not a PDF')) {
      throw err
    }

    return null
  } finally {
    rmSync(verifyDir, { recursive: true, force: true })
  }
}

for (const magnet of LEAD_MAGNETS) {
  const pageResponse = await fetch(`${marketingBaseUrl}/resources/${magnet.slug}`)
  if (!pageResponse.ok) {
    throw new Error(`Missing marketing page for ${magnet.slug}: ${pageResponse.status}`)
  }

  const manifestEntry = manifestBySlug.get(magnet.slug)
  if (!manifestEntry || manifestEntry.r2Key !== magnet.r2Key) {
    throw new Error(`PDF manifest mismatch for ${magnet.slug}`)
  }

  const r2Object = await getVerifiedLeadMagnetObject(
    process.env.R2_LEAD_MAGNETS_BUCKET ?? '',
    manifestEntry.r2Key,
  )
  if (!r2Object) {
    throw new Error(`Missing R2 object for ${magnet.slug}: ${manifestEntry.r2Key}`)
  }

  const r2ContentType = r2Object.httpMetadata?.contentType ?? ''
  if (r2ContentType && !r2ContentType.includes('application/pdf')) {
    throw new Error(`Unexpected R2 content-type for ${magnet.slug}: ${r2ContentType}`)
  }

  const downloadResponse = await fetch(`${appBaseUrl}/api/marketing/lead-magnets/${magnet.slug}`, {
    method: 'HEAD',
  })

  if (!downloadResponse.ok) {
    throw new Error(`HEAD download failed for ${magnet.slug}: ${downloadResponse.status}`)
  }

  const contentType = downloadResponse.headers.get('content-type') ?? ''
  const contentDisposition = downloadResponse.headers.get('content-disposition') ?? ''
  const cacheControl = downloadResponse.headers.get('cache-control') ?? ''

  if (!contentType.includes('application/pdf')) {
    throw new Error(`Unexpected content-type for ${magnet.slug}: ${contentType}`)
  }

  if (!contentDisposition.includes(`${magnet.slug}.pdf`)) {
    throw new Error(`Unexpected content-disposition for ${magnet.slug}: ${contentDisposition}`)
  }

  if (!cacheControl.includes('no-store')) {
    throw new Error(`Expected no-store cache control for ${magnet.slug}: ${cacheControl}`)
  }
}

console.log(`Verified ${LEAD_MAGNETS.length} lead magnets.`)
