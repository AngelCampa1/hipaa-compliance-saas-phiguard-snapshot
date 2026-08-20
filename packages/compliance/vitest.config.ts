import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: false,
    environment: 'node',
    // The integration suites here start a real Postgres through testcontainers,
    // same as @phiguard/db, @phiguard/audit and @phiguard/integration, which all
    // allow 120s. This package was left on vitest's 10s default, so its setup
    // hooks time out on a loaded or cold machine while every test still passes.
    testTimeout: 120_000,
    hookTimeout: 120_000,
  },
})
