/// <reference types="vitest/config" />
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  // API origin for the dev proxy comes from the repo-root .env (SENNIN_API_ORIGIN), never from code.
  const env = loadEnv(mode, '../..', 'SENNIN_')
  const apiOrigin = env.SENNIN_API_ORIGIN

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      // Copy and other changeable data live in the repo-root config/ (CLAUDE.md 1.2).
      alias: { '@config': fileURLToPath(new URL('../../config', import.meta.url)) },
    },
    envDir: '../..',
    envPrefix: 'SENNIN_PUBLIC_',
    server: {
      fs: { allow: ['../..'] },
      proxy: apiOrigin
        ? {
            '/api': apiOrigin,
            '/hubs': { target: apiOrigin, ws: true },
          }
        : undefined,
    },
    test: {
      environment: 'jsdom',
      globals: false,
      setupFiles: ['./src/test/setup.ts'],
      include: ['src/**/*.test.{ts,tsx}'],
    },
  }
})
