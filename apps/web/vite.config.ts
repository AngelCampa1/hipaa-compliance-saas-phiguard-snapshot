import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import { cloudflare } from '@cloudflare/vite-plugin'
import { sentryVitePlugin } from '@sentry/vite-plugin'
import tailwindcss from '@tailwindcss/vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import type { Plugin } from 'vite'

/**
 * Prevents server-only Node.js packages from leaking into the client bundle.
 *
 * TanStack Start strips createServerFn handler bodies for the client build,
 * but the top-level imports in server function files remain in the module
 * graph. Rollup validates named exports before tree-shaking, which causes
 * build failures when Node.js built-ins like `perf_hooks` (used by postgres)
 * are resolved to browser stubs that are missing expected exports.
 *
 * This plugin short-circuits resolution of known server-only packages in
 * the client environment so they never enter the module graph at all.
 */
function serverOnlyShimPlugin(): Plugin {
  const SERVER_ONLY_IDS = new Set([
    // Node.js built-ins (bare and node: prefix)
    'async_hooks',
    'node:async_hooks',
    'perf_hooks',
    'node:perf_hooks',
    'crypto',
    'node:crypto',
    'stream',
    'node:stream',
    'net',
    'node:net',
    'tls',
    'node:tls',
    'fs',
    'node:fs',
    'path',
    'node:path',
    'os',
    'node:os',
    'dns',
    'node:dns',
    'events',
    'node:events',
    'util',
    'node:util',
    'assert',
    'node:assert',
    'url',
    'node:url',
    'zlib',
    'node:zlib',
    'http',
    'node:http',
    'https',
    'node:https',
    'http2',
    'node:http2',
    'child_process',
    'node:child_process',
    'worker_threads',
    'node:worker_threads',
    // Server-only npm packages
    'postgres',
    'pg',
    'pg-native',
    'pino',
    'pino-pretty',
    '@aws-sdk/client-s3',
    '@aws-sdk/s3-request-presigner',
    '@sentry/cloudflare',
    '@sentry/node',
    '@phiguard/auth',
  ])

  return {
    name: 'server-only-shim',
    enforce: 'pre',
    resolveId(id, _importer, options) {
      const isClientBuild = this.environment?.name === 'client' || options?.ssr === false
      if (isClientBuild && SERVER_ONLY_IDS.has(id)) {
        return '\0server-only-shim:' + id
      }
    },
    load(id) {
      if (!id.startsWith('\0server-only-shim:')) return
      const pkg = id.slice('\0server-only-shim:'.length)

      // Per-module named export stubs so Rollup's named-export validation passes.
      // These are only reached in the client bundle where TanStack Start has
      // replaced server function handlers with RPC stubs — none of this runs.
      const asyncHooksStub = `
export class AsyncLocalStorage {
  constructor(){}
  run(_s,fn,...a){return fn(...a)}
  getStore(){return undefined}
  enterWith(){}
  disable(){}
}
export class AsyncResource {}
export function executionAsyncId(){return 0}
export function triggerAsyncId(){return 0}
`
      const perfHooksStub = `
export const performance = globalThis.performance ?? { now:()=>Date.now(), mark:()=>{}, measure:()=>{} }
export const monitorEventLoopDelay = ()=>({enable:()=>{},disable:()=>{},percentile:()=>0,mean:0})
`
      const zlibStub = `
export const gzipSync = ()=>new Uint8Array()
export const gunzipSync = ()=>new Uint8Array()
export const deflateSync = ()=>new Uint8Array()
export const inflateSync = ()=>new Uint8Array()
export const brotliCompressSync = ()=>new Uint8Array()
export const brotliDecompressSync = ()=>new Uint8Array()
export function createGzip(){return {pipe:(s)=>s,write:()=>{},end:()=>{}}}
export function createGunzip(){return {pipe:(s)=>s,write:()=>{},end:()=>{}}}
`
      const cryptoStub = `
export const webcrypto = globalThis.crypto
export function createHash(){return{update(){return this},digest(){return ""}}}
export function randomBytes(n){return new Uint8Array(n)}
export function randomUUID(){return (globalThis.crypto?.randomUUID?.()??"")}
export function createHmac(){return{update(){return this},digest(){return ""}}}
export function pbkdf2Sync(){return new Uint8Array()}
export function scryptSync(){return new Uint8Array()}
export function createCipheriv(){return{update:()=>Buffer.from(""),final:()=>Buffer.from("")}}
export function createDecipheriv(){return{update:()=>Buffer.from(""),final:()=>Buffer.from("")}}
`
      const s3Stub = `
export class S3Client { constructor(){} send(){return Promise.resolve({})} destroy(){} }
export class HeadObjectCommand { constructor(i){this.input=i} }
export class PutObjectCommand { constructor(i){this.input=i} }
export class GetObjectCommand { constructor(i){this.input=i} }
export class DeleteObjectCommand { constructor(i){this.input=i} }
export class CreateMultipartUploadCommand { constructor(i){this.input=i} }
export class UploadPartCommand { constructor(i){this.input=i} }
export class CompleteMultipartUploadCommand { constructor(i){this.input=i} }
export class AbortMultipartUploadCommand { constructor(i){this.input=i} }
`
      const presignerStub = `
export async function getSignedUrl(){return ""}
`
      const sentryStub = `
export function withScope(fn){try{fn({setTag:()=>{},setExtra:()=>{},setExtras:()=>{},setUser:()=>{},setTransactionName:()=>{}})}catch{}}
export function captureException(){}
export function captureMessage(){}
export function init(){}
export function setUser(){}
export function setTag(){}
export function startSpan(opts,fn){return fn()}
export function startActiveSpan(name,fn){return fn({})}
export const metrics={increment:()=>{},distribution:()=>{},gauge:()=>{},set:()=>{}}
`
      const phiguardAuthStub = `
export const auth = { api: { getSession: async () => null } }
export function hashCredentialPassword() { return Promise.resolve("") }
export function hasRole() { return false }
export function isOwner() { return false }
export function isAdmin() { return false }
export function isStaff() { return false }
export function canManageMembers() { return false }
export function canAccessSoc2() { return false }
export async function listUserOrganizations() { return [] }
export async function resolveOrganizationAccess() { return { status: "ready", scope: { role: null } } }
export async function createSessionBootstrapCookie() { return null }
export function requireSecret() { return "" }
export async function getSession() { return null }
`
      const pinoStub = `
const noop = () => {}
export default function pino() {
  return {
    info: noop,
    warn: noop,
    error: noop,
    debug: noop,
    child() {
      return this
    },
  }
}
`

      const stubs: Record<string, string> = {
        async_hooks: asyncHooksStub,
        'node:async_hooks': asyncHooksStub,
        perf_hooks: perfHooksStub,
        'node:perf_hooks': perfHooksStub,
        zlib: zlibStub,
        'node:zlib': zlibStub,
        crypto: cryptoStub,
        'node:crypto': cryptoStub,
        '@aws-sdk/client-s3': s3Stub,
        '@aws-sdk/s3-request-presigner': presignerStub,
        '@sentry/cloudflare': sentryStub,
        '@sentry/node': sentryStub,
        pino: pinoStub,
        '@phiguard/auth': phiguardAuthStub,
      }

      return stubs[pkg] ?? 'export default undefined'
    },
  }
}

function buildSentryVitePlugin(project: string): Plugin[] {
  const authToken = process.env.SENTRY_AUTH_TOKEN
  const org = process.env.SENTRY_ORG
  const release = process.env.SENTRY_RELEASE

  if (!authToken || !org || !release) {
    return []
  }

  return sentryVitePlugin({
    authToken,
    org,
    project,
    release: {
      name: release,
    },
    telemetry: false,
    sourcemaps: {
      assets: ['./dist/client/**'],
      filesToDeleteAfterUpload: ['./dist/client/**/*.map'],
    },
  }) as Plugin[]
}

function hasSentryUploadConfig() {
  return Boolean(
    process.env.SENTRY_AUTH_TOKEN && process.env.SENTRY_ORG && process.env.SENTRY_RELEASE,
  )
}

export default defineConfig({
  plugins: [
    cloudflare({
      viteEnvironment: { name: 'ssr' },
    }),
    tsconfigPaths({
      projects: ['./tsconfig.json'],
      ignoreConfigErrors: true,
    }),
    tailwindcss(),
    tanstackStart(),
    serverOnlyShimPlugin(),
    ...buildSentryVitePlugin('phiguard-app-client'),
  ],
  build: {
    sourcemap: hasSentryUploadConfig(),
  },
  resolve: {
    dedupe: ['react', 'react-dom', 'react/jsx-runtime'],
    alias: {
      // `@ventora/ai-cs` is a private-registry package and is not distributed
      // with this public snapshot. It resolves to a documented no-op stub so
      // the build succeeds without registry access; see the stub's header for
      // what is real and what is not.
      '@ventora/ai-cs/react': fileURLToPath(
        new URL('./src/vendor-stubs/ventora-ai-cs-react.ts', import.meta.url),
      ),
    },
  },
  ssr: {
    optimizeDeps: {
      include: ['react', 'react-dom', 'react/jsx-runtime'],
    },
  },
})
