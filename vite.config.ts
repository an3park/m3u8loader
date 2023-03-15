import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [],
  base: 'm3u8loader',
  build: {
    outDir: 'm3u8loader',
  },
  server: {
    port: 3000,
  },
})
