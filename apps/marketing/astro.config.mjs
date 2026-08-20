import { defineConfig } from 'astro/config'
import { sentryVitePlugin } from '@sentry/vite-plugin'
import tailwindcss from '@tailwindcss/vite'
import { PHIGUARD_PUBLIC_SITE_ORIGIN } from '@phiguard/brand/identity'

function hasSentryUploadConfig() {
  const authToken = process.env.SENTRY_AUTH_TOKEN
  const org = process.env.SENTRY_ORG
  const release = process.env.SENTRY_RELEASE

  return Boolean(authToken && org && release)
}

function buildSentryVitePlugin(project) {
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
      assets: ['./dist/**'],
      filesToDeleteAfterUpload: ['./dist/**/*.map'],
    },
  })
}

function hasSentryUploadConfig() {
  const authToken = process.env.SENTRY_AUTH_TOKEN
  const org = process.env.SENTRY_ORG
  const release = process.env.SENTRY_RELEASE

  return Boolean(authToken && org && release)
}

function buildSentryVitePlugin(project) {
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
      assets: ['./dist/**'],
      filesToDeleteAfterUpload: ['./dist/**/*.map'],
    },
  })
}

export default defineConfig({
  site: PHIGUARD_PUBLIC_SITE_ORIGIN,
  output: 'static',
  trailingSlash: 'never',
  vite: {
    build: {
      sourcemap: hasSentryUploadConfig(),
    },
    plugins: [tailwindcss(), ...buildSentryVitePlugin('phiguard-marketing')],
  },
})
