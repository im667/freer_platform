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
              src: '/meta-pixel.js' // 외부 스크립트 방식 추천
            }
          },
          {
            injectTo: 'body',
            tag: 'noscript',
            children: `
              <img height="1" width="1" style="display:none"
              src="https://www.facebook.com/tr?id=617665268001613&ev=PageView&noscript=1"
              />
            `.trim()
          }
        ]
      }
    })
  ]
});


