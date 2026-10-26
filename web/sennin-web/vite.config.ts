/// <reference types="vitest/config" />
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  // API origin for the dev proxy comes from the repo-root .env (SENNIN_API_ORIGIN), never from code.
  const env = loadEnv(mode, '../..', 'SENNIN_')
  const apiOrigin = env.SENNIN_API_ORIGIN

  return {
    plugins: [react(), tailwindcss()],
    envDir: '../..',
    envPrefix: 'SENNIN_PUBLIC_',
    server: apiOrigin
      ? {
          proxy: {
            '/api': apiOrigin,
            '/hubs': { target: apiOrigin, ws: true },
          },
        }
      : undefined,
    test: {
      environment: 'jsdom',
      globals: false,
      setupFiles: ['./src/test/setup.ts'],
      include: ['src/**/*.test.{ts,tsx}'],
    },
  }
})
