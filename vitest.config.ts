import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.spec.ts', 'test/**/*.test.ts'],
    setupFiles: ['dotenv/config', './vitest.setup.ts'],
    timeout: 10000,
    env: {
      BASE_URL: undefined, // or delete process.env.BASE_URL
    },
  },
})
