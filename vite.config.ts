import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '')

  return {
    plugins: [react()],
    server: {
      port: 3002,
      host: true,
      proxy: {
        '/api/openai': {
          target: env.OPENAI_PROXY_TARGET || 'http://localhost:8787',
          changeOrigin: true,
        },
      },
    },
  }
})
