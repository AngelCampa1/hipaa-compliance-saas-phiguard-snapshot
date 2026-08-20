import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [
    tsconfigPaths({
      projects: ['./tsconfig.json'],
      ignoreConfigErrors: true,
    }),
  ],
  resolve: {
    alias: {
      // See `vite.config.ts` — the private-registry package is not part of this
      // snapshot, so both the build and the tests resolve it to the same stub.
      '@ventora/ai-cs/react': fileURLToPath(
        new URL('./src/vendor-stubs/ventora-ai-cs-react.ts', import.meta.url),
      ),
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    exclude: ['**/*.e2e.ts', 'src/**/*.spec.ts'],
    setupFiles: ['./vitest.setup.ts'],
    testTimeout: 120_000,
    hookTimeout: 120_000,
  },
})
