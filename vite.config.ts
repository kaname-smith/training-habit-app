import { defineConfig, configDefaults } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/tests/setup.ts'],
    // e2e/**/*.spec.ts are Playwright specs (see playwright.config.ts), not
    // Vitest tests — exclude them so `npm run test` doesn't try to run both.
    exclude: [...configDefaults.exclude, 'e2e/**'],
  },
})
