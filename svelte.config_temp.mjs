//const sveltePreprocess = require("svelte-preprocess");
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
//module.exports = {
//  preprocess: [
//    sveltePreprocess({
//      postcss: true
//    }),
//  ],
//};
export default {
  preprocess: [vitePreprocess({ script: true })],
  compilerOptions: {
    runes: false
  }
};