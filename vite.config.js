import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import sveltePreprocess from 'svelte-preprocess'
import { VitePWA } from 'vite-plugin-pwa'
import loadVersion from 'vite-plugin-package-version'
import manifest from './manifest'
import path from 'path'
import svelteSVG from 'vite-plugin-svelte-svg'
import { visualizer } from 'rollup-plugin-visualizer'
import rollupPluginsSvelte from 'rollup-plugin-svelte-svg'

import { string } from 'rollup-plugin-string'

export default defineConfig({
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
      preprocess: sveltePreprocess({
        postcss: true,
      }),
    }),
    loadVersion(),
    // rollupPluginsSvelte({}),
    svelteSVG({
      svgoConfig: {}, // See https://github.com/svg/svgo#configuration
    }),

    VitePWA({
      manifest: manifest,
      maximumFileSizeToCacheInBytes: 1000 * 1000 * 4
    }),
  ],
})
