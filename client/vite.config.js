import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    visualizer({
      filename: 'stats.html',
      gzipSize: true,
      brotliSize: true,
      open: false // Set to false to avoid trying to open a browser in this environment
    })
  ],
  build: {
    outDir: "dist",
    reportCompressedSize: false,
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'core-vendor': ['react', 'react-dom', 'react-router-dom'],
          'animation-vendor': ['framer-motion'],
          'chart-vendor': ['recharts'],
          'network-vendor': ['axios']
        }
      }
    },
    chunkSizeWarningLimit: 1000,
    esbuild: {
      drop: ['console', 'debugger']
    }
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

