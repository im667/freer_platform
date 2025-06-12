import { defineConfig } from 'vite';
import { createHtmlPlugin } from 'vite-plugin-html';

export default defineConfig({
   build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        result: 'result.html', // 추가!
      },
    },
  },
   plugins: [
    createHtmlPlugin({
      inject: {
        tags: [
          {
            injectTo: 'head',
            tag: 'script',
            attrs: {
             // 외부 스크립트 방식 추천
            }
          }
        ]
      }
    })
  ]
});


