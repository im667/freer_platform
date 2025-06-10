// vite.config.ts
import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        result: path.resolve(__dirname, 'src/result.html'),
      },
    },
  },
})
