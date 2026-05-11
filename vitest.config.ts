import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    css: true,
    // Harness self-tests under .agentic/** use node:test, not vitest. Exclude them
    // so `npm test` (vitest) doesn't pick them up and fail with "No test suite found".
    exclude: ['**/node_modules/**', '**/dist/**', '.agentic/**', 'e2e/**'],
  },
})
