import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  build: {
    outDir: "dist",
  },
  base: "/",
  server: mode === "development" ? {
    port: 5173,
    proxy: {
      "/api": {
        target: "https://gt-schoolhub.onrender.com",
        changeOrigin: true,
        secure: true,
      },
    },
  } : undefined,
}));

