import path from 'path'
import { defineConfig, loadEnv } from 'vite'

import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/

export default defineConfig(({ mode }) => {
  return {
    plugins: [react()],
    base: '/',
    build: {
      outDir: '../server/public',
      chunkSizeWarningLimit: 6000,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              return id
                .toString()
                .split('node_modules')[1]
                .split('/')[0]
                .toString()
            }
          },
        },
      },
    },
    server: {
      port: 4000,
      host: '0.0.0.0',
      open: true,
      proxy: {
        '/api': {
          target: loadEnv(mode, process.cwd()).VITE_APP_BACKEND_URL,
          changeOrigin: true,
        },
        '/trpc': {
          target: loadEnv(mode, process.cwd()).VITE_APP_BACKEND_URL,
          changeOrigin: true,
        },
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '~': path.resolve(__dirname, '../server/src'),
      },
    },
  }
})
