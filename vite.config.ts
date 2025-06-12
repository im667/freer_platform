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
            injectTo: 'head', // head에 넣는다
            tag: 'script',
            attrs: {
              // 여기에 src 쓰면 외부파일, 아니면 innerHTML로 삽입
            },
            children: `
              <!-- Meta Pixel Code -->
          
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '617665268001613');
              fbq('track', 'PageView');
           
            
              <!-- End Meta Pixel Code -->
            `.trim()
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


