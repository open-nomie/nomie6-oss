const sveltePreprocess = require("svelte-preprocess");
module.exports = {
  preprocess: [
    sveltePreprocess({
      postcss: true
    }),
  ],
  compilerOptions: {
    compatibility: {
      componentApi: 4
    },
    runes: false
  }
};