import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';
import components from 'unplugin-vue-components/vite';
import { HeadlessUiResolver } from 'unplugin-vue-components/resolvers';
import icons from 'unplugin-icons/vite';
import ViteIconsResolver from 'unplugin-icons/resolver';
import pages from 'vite-plugin-pages';
import layouts from 'vite-plugin-vue-layouts';
import markdown from 'vite-plugin-md';
import shiki from 'shiki';
import anchorPlugin from 'markdown-it-anchor';
import taskListsPlugin from 'markdown-it-task-lists';
import AutoImport from 'unplugin-auto-import/vite';

export default defineConfig(async ({ command, mode }) => {
  const shikiHighlighter = await shiki.getHighlighter({
    themes: ['dark-plus', 'github-light']
  });

  return {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src')
      }
    },
    base: '/',
    ssgOptions: {
      script: 'async',
      formatting: 'minify'
    },
    server: {
      fs: {
        strict: false
      }
    },
    optimizeDeps: {
      include: [
        'vue',
        'vue-router',
        '@vueuse/core',
        '@vueuse/head',
      ],
    },
    plugins: [
      vue({
        include: [/\.vue$/, /\.md$/],
        script: {
          refSugar: true
        }
      }),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.svg', 'robots.txt', 'safari-pinned-tab.svg'],
        manifest: {
          name: 'Blog',
          short_name: 'Blog',
          theme_color: '#ffffff',
          icons: [
            {
              src: 'pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png'
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable'
            }
          ]
        }
      }),
      pages({
        extensions: ['vue', 'md'],
        importMode: 'async',
        // extendRoute 부분에서 metaResolver 관련 코드 제거
        extendRoute(route) {
          if (!route.name) {
            route.name = route.path.replace('/', '');
          }

          // Markdown 파일에 대한 추가 처리가 필요하다면 여기에 작성
          return route;
        }
      }),
      layouts(),
      AutoImport({
        include: [
          /\.[tj]sx?$/,
          /\.vue$/, /\.vue\?vue/,
          /\.md$/,
        ],
        imports: [
          'vue',
        ],
        dts: 'src/auto-imports.d.ts',
      }),
      components({
        extensions: ['vue', 'md'],
        include: [/\.vue$/, /\.vue\?vue/, /\.md$/],
        resolvers: [
          HeadlessUiResolver(),
          ViteIconsResolver()
        ],
        dts: 'src/components.d.ts',
      }),
      icons({
        autoInstall: true
      }),
      markdown({
        wrapperClasses: 'post__layout !mx-auto prose dark:prose-dark',
        wrapperComponent: 'Markdown',
        headEnabled: true,
        markdownItOptions: {
          html: true,
          linkify: true,
          breaks: true,
          lineNumbers: false,
          highlight: (code, lang) => {
            const dark = shikiHighlighter
                .codeToHtml(code, { lang: lang || 'text', theme: 'dark-plus' })
                .replace('<pre class="shiki"', '<pre class="shiki shiki-dark"');
            const light = shikiHighlighter
                .codeToHtml(code, { lang: lang || 'text', theme: 'github-light' })
                .replace('<pre class="shiki"', '<pre class="shiki shiki-light"');
            return `${dark}${light}`;
          }
        },
        markdownItSetup(md) {
          md.use(taskListsPlugin)
              .use(anchorPlugin, {
                permalink: anchorPlugin.permalink.ariaHidden({
                  placement: 'before',
                  symbol: '#',
                  class:
                      'header-anchor w-[1em] opacity-0 hover:opacity-100 focus:opacity-100 group-hover:opacity-100 absolute left-[-1em] !font-bold !ring-0',
                  space: false
                })
              });
        }
      })
    ]
  };
});
