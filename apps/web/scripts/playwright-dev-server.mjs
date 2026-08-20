import { dirname } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'

const DEFAULT_PORT = 3210
const host = '127.0.0.1'
const port = Number(process.env.PORT ?? DEFAULT_PORT)
const appRoot = dirname(dirname(fileURLToPath(import.meta.url)))
const runtimeReadyPrefix = 'PLAYWRIGHT_RUNTIME_READY:'

let server

async function shutdown(exitCode = 0) {
  if (server) {
    await server.close()
  }

  process.exit(exitCode)
}

async function start() {
  server = await createServer({
    root: appRoot,
    mode: 'production',
    server: {
      host,
      port,
      strictPort: true,
    },
  })

  await server.listen()
  const runtimeToken = process.env.PLAYWRIGHT_RUNTIME_TOKEN
  server.printUrls()
  if (runtimeToken) {
    console.log(`${runtimeReadyPrefix}${runtimeToken}`)
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
}

void start().catch((error) => {
  console.error(error)
  process.exit(1)
})
