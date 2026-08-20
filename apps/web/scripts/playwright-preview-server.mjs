import { createServer } from 'node:http'
import { Readable } from 'node:stream'
import { access, readFile } from 'node:fs/promises'
import { createReadStream } from 'node:fs'
import { dirname, extname, isAbsolute, join, relative, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const DEFAULT_PORT = 3210
const host = '127.0.0.1'
const port = Number(process.env.PORT ?? DEFAULT_PORT)
const __dirname = dirname(fileURLToPath(import.meta.url))
const appRoot = dirname(__dirname)
const clientRoot = join(appRoot, 'dist', 'client')
const runtimeReadyPrefix = 'PLAYWRIGHT_RUNTIME_READY:'

function toArrayBufferView(value) {
  if (value instanceof Uint8Array) {
    return value
  }

  if (ArrayBuffer.isView(value)) {
    return new Uint8Array(value.buffer, value.byteOffset, value.byteLength)
  }

  if (value instanceof ArrayBuffer) {
    return new Uint8Array(value)
  }

  if (value instanceof Blob) {
    return value
  }

  if (typeof value === 'string') {
    return Buffer.from(value)
  }

  return value
}

function createMemoryObjectStorageBucket() {
  const objects = new Map()

  return {
    async get(key) {
      const object = objects.get(key)
      if (!object) return null

      return {
        body: new Blob([object.body]).stream(),
        httpMetadata: object.httpMetadata,
        size: object.body.byteLength,
      }
    },
    async head(key) {
      const object = objects.get(key)
      if (!object) return null

      return {
        httpMetadata: object.httpMetadata,
        size: object.body.byteLength,
      }
    },
    async put(key, value, options) {
      let body = toArrayBufferView(value)

      if (body instanceof Blob) {
        body = new Uint8Array(await body.arrayBuffer())
      } else if (body instanceof ReadableStream) {
        body = new Uint8Array(await new Response(body).arrayBuffer())
      }

      objects.set(key, {
        body: Buffer.from(body),
        httpMetadata: options?.httpMetadata ?? null,
      })
    },
  }
}

// Imported lazily: `@phiguard/audit` exports raw TypeScript (`./src/index.ts`),
// which plain Node cannot load. Only the direct-uploads path needs it, and
// `preview-server.ts` runs this script under tsx in exactly that case — so a
// static import would break every other run before the server ever starts.
if (process.env.PLAYWRIGHT_DIRECT_UPLOADS === 'true') {
  const { setObjectStorageBindings } = await import('@phiguard/audit')
  setObjectStorageBindings({
    attachments: createMemoryObjectStorageBucket(),
  })
}

const { default: server } = await import('../dist/server/server.js')

const CONTENT_TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
}

function getContentType(filePath) {
  return CONTENT_TYPES[extname(filePath)] ?? 'application/octet-stream'
}

function isStaticAssetPath(pathname) {
  return (
    pathname === '/favicon.svg'
    || pathname === '/favicon.png'
    || pathname === '/apple-touch-icon.png'
    || pathname === '/logo-horizontal.png'
    || pathname === '/logo-horizontal-inverse.png'
    || pathname === '/logo-mark.png'
    || pathname === '/logo-mark-inverse.png'
    || pathname === '/wrangler.json'
    || pathname.startsWith('/assets/')
  )
}

function resolveStaticAssetPath(pathname) {
  const relativePath = pathname.replace(/^\/+/, '')
  const assetPath = resolve(clientRoot, relativePath)
  const relativeAssetPath = relative(clientRoot, assetPath)

  if (relativeAssetPath.startsWith('..') || isAbsolute(relativeAssetPath)) {
    return null
  }

  return assetPath
}

async function serveStaticAsset(pathname, res) {
  const assetPath = resolveStaticAssetPath(pathname)
  if (!assetPath) {
    return false
  }

  try {
    await access(assetPath)
  } catch {
    return false
  }

  res.writeHead(200, {
    'Content-Type': getContentType(assetPath),
    'Cache-Control': pathname.startsWith('/assets/')
      ? 'public, max-age=31536000, immutable'
      : 'public, max-age=300',
  })

  await new Promise((resolve, reject) => {
    const stream = createReadStream(assetPath)
    stream.on('error', reject)
    res.on('close', resolve)
    stream.pipe(res)
  })

  return true
}

async function readRequestBody(req) {
  const chunks = []
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
  }
  if (chunks.length === 0) {
    return undefined
  }
  return Buffer.concat(chunks)
}

async function handleRequest(req, res) {
  const url = new URL(req.url ?? '/', `http://${req.headers.host ?? `${host}:${port}`}`)

  if (url.pathname === '/__playwright/attachment-scan' && req.method === 'POST') {
    await readRequestBody(req)
    res.writeHead(202, {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    })
    res.end(JSON.stringify({ accepted: true }))
    return
  }

  if (isStaticAssetPath(url.pathname) && await serveStaticAsset(url.pathname, res)) {
    return
  }

  const headers = new Headers()
  for (const [key, value] of Object.entries(req.headers)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        headers.append(key, item)
      }
      continue
    }

    if (typeof value === 'string') {
      headers.set(key, value)
    }
  }

  const body = req.method === 'GET' || req.method === 'HEAD'
    ? undefined
    : await readRequestBody(req)

  const request = new Request(url, {
    method: req.method,
    headers,
    body,
  })

  const response = await server.fetch(request)
  const responseHeaders = {}
  for (const [name, value] of response.headers.entries()) {
    if (name.toLowerCase() === 'set-cookie') {
      continue
    }

    responseHeaders[name] = value
  }

  const setCookieHeaders = typeof response.headers.getSetCookie === 'function'
    ? response.headers.getSetCookie()
    : []

  if (setCookieHeaders.length > 0) {
    responseHeaders['set-cookie'] = setCookieHeaders
  }

  res.writeHead(response.status, responseHeaders)

  if (!response.body) {
    res.end()
    return
  }

  await new Promise((resolve, reject) => {
    const bodyStream = Readable.fromWeb(response.body)
    bodyStream.on('error', reject)
    res.on('close', resolve)
    bodyStream.pipe(res)
  })
}

const httpServer = createServer((req, res) => {
  void handleRequest(req, res).catch(async (error) => {
    console.error(error)
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' })
    res.end('Internal Server Error')
  })
})

httpServer.listen(port, host, () => {
  console.log(`  Local:   http://${host}:${port}/`)
  const runtimeToken = process.env.PLAYWRIGHT_RUNTIME_TOKEN
  if (runtimeToken) {
    console.log(`${runtimeReadyPrefix}${runtimeToken}`)
  }
})

async function shutdown(exitCode = 0) {
  await new Promise((resolve) => httpServer.close(resolve))
  process.exit(exitCode)
}

process.on('SIGINT', () => {
  void shutdown(0)
})

process.on('SIGTERM', () => {
  void shutdown(0)
})

process.on('uncaughtException', (error) => {
  console.error(error)
})

process.on('unhandledRejection', (error) => {
  console.error(error)
})
