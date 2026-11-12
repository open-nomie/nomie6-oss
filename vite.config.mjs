import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import sveltePreprocess from 'svelte-preprocess'
import { VitePWA } from 'vite-plugin-pwa'
// import loadVersion from 'vite-plugin-package-version'
import manifest from './manifest'
import path from 'path'
import svelteSVG from 'vite-plugin-svelte-svg'
import { visualizer } from 'rollup-plugin-visualizer'
import rollupPluginsSvelte from 'rollup-plugin-svelte-svg'

import { string } from 'rollup-plugin-string'

// Polyfill structuredClone for vite-plugin-pwa
if (!globalThis.structuredClone) {
  globalThis.structuredClone = (obj) => JSON.parse(JSON.stringify(obj));
}

export default defineConfig({
  define: {
    'import.meta.env.PACKAGE_VERSION': JSON.stringify(process.env.npm_package_version)
  },
  optimizeDeps: {
    allowNodeBuiltins: ['pouchdb-browser', 'pouchdb-utils'],
    exclude: ['canvas-confetti', 'tributejs', 'svelte-navigator'],
  },
  build: {
    rollupOptions: {
      // external: ['aws-sdk','aws-sdk/clients/S3'],
      output: {
        // globals: {
        //   'aws-sdk': 'AWS',
        //   'S3': 'aws-sdk/clients/S3'
        // },
      },
      plugins: [
        // visualizer({ filename: 'stats.html' }),
        rollupPluginsSvelte,
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve('/src'),
    },
  },
  plugins: [
    svelte({

    }),
    svelteSVG({
      svgoConfig: {}, // See https://github.com/svg/svgo#configuration
    }),

    VitePWA({
      manifest: manifest,
      maximumFileSizeToCacheInBytes: 20 * 1024 ** 2, // 20 MB (for 7.15 MB main JS bundle)

      // Workbox configuration for intelligent caching strategies
      workbox: {
        // HTML - always network first (want latest version)
        navigateFallback: '/index.html',
        maximumFileSizeToCacheInBytes: 20 * 1024 * 1024, // 20 MB for large JS bundle

        // Caching strategies for different asset types
        runtimeCaching: [
          // API calls - network first with cache fallback
          {
            urlPattern: /^https?:\/\/(?:api\.|localhost:|127\.0\.0\.1:)/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              networkTimeoutSeconds: 10,
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 5 * 60, // 5 minutes
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          // Images - cache first with network fallback
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'image-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          // CSS and JS - cache first (versioned by build hash)
          {
            urlPattern: /\.(?:js|css)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'assets-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
              },
            },
          },
          // Fonts - cache first with long expiry
          {
            urlPattern: /\.(?:woff|woff2|ttf|otf|eot)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'fonts-cache',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 24 * 60 * 60, // 60 days
              },
            },
          },
        ],

        // Clean up old caches on activation
        cleanupOutdatedCaches: true,

        // Skip waiting (apply updates immediately)
        skipWaiting: false, // Keep false for controlled updates via PWAService
        clientsClaim: true,
      },

      // Development options
      devOptions: {
        enabled: false, // PWA disabled in dev mode (as implemented in PWAService)
      },
    }),
  ],
})
