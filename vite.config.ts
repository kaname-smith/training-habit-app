import { defineConfig, configDefaults } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  // GitHub Pages project-page path, applied to `vite build` only so local
  // `npm run dev` (and the Playwright webServer, which runs against dev)
  // keep serving at root. If the repository is ever renamed, update this
  // (and public/manifest.webmanifest, which is not rewritten by Vite's HTML
  // processing) to match.
  base: command === 'build' ? '/training-habit-app/' : '/',
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/tests/setup.ts'],
    // e2e/**/*.spec.ts are Playwright specs (see playwright.config.ts), not
    // Vitest tests — exclude them so `npm run test` doesn't try to run both.
    exclude: [...configDefaults.exclude, 'e2e/**'],
  },
}))
