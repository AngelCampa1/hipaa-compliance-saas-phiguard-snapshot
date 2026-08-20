import { createFileRoute } from '@tanstack/react-router'
import { isLeadMagnetSlug } from '@phiguard/lead-magnets'
import { applyObjectStorageHttpMetadata } from '../../../lib/object-storage.js'
import { buildLeadMagnetKey, getLeadMagnetHead, getLeadMagnetObject } from '../../../lib/s3.js'
import { captureServerException } from '../../../lib/sentry.js'

const SLUG_RE = /^[a-z0-9-]{1,100}$/

async function getLeadMagnetResponseParts(slug: string, method: 'GET' | 'HEAD') {
  if (!SLUG_RE.test(slug) || !isLeadMagnetSlug(slug)) {
    return { status: 404, headers: new Headers(), body: null }
  }

  const key = buildLeadMagnetKey(slug)
  const object =
    method === 'GET'
      ? await getLeadMagnetObject(key)
      : await getLeadMagnetHead(key)
  if (!object) {
    return { status: 404, headers: new Headers(), body: null }
  }

  if (method === 'GET' && !object.body) {
    return { status: 404, headers: new Headers(), body: null }
  }

  const headers = new Headers()
  applyObjectStorageHttpMetadata(headers, object)
  headers.set('Content-Type', headers.get('Content-Type') ?? 'application/pdf')
  headers.set('Content-Disposition', `attachment; filename="${slug}.pdf"`)
  headers.set('Cache-Control', 'private, no-store, max-age=0')

  return {
    status: 200,
    headers,
    body: method === 'GET' ? object.body ?? null : null,
  }
}

async function handleLeadMagnetDownload(slug: string, method: 'GET' | 'HEAD') {
  const result = await getLeadMagnetResponseParts(slug, method)
  return new Response(result.body, {
    status: result.status,
    headers: result.headers,
  })
}

export const Route = createFileRoute('/api/marketing/lead-magnets/$slug')({
  server: {
    handlers: {
      GET: async ({ params }) => {
        try {
          return await handleLeadMagnetDownload(params.slug, 'GET')
        } catch (error) {
          captureServerException(error, {
            surface: 'api',
            route: '/api/marketing/lead-magnets/$slug',
            operation: 'lead-magnet.download',
            status: 500,
            tags: { method: 'GET', slug: params.slug },
          })
          return new Response('Internal Server Error', { status: 500 })
        }
      },
      HEAD: async ({ params }) => {
        try {
          return await handleLeadMagnetDownload(params.slug, 'HEAD')
        } catch (error) {
          captureServerException(error, {
            surface: 'api',
            route: '/api/marketing/lead-magnets/$slug',
            operation: 'lead-magnet.download',
            status: 500,
            tags: { method: 'HEAD', slug: params.slug },
          })
          return new Response('Internal Server Error', { status: 500 })
        }
      },
    },
  },
})
