module.exports = {
  env: {
    browser: true,
    es6: true,
    jest: true,
  },
  extends: 'eslint:recommended',
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  plugins: [
    'svelte3',
    '@typescript-eslint', // add the TypeScript plugin
  ],
  parserOptions: {
    ecmaVersion: 2019,
    sourceType: 'module',
  },
  overrides: [
    // this stays the same
    {
      files: ['*.svelte'],
      processor: 'svelte3/svelte3',
    },
  ],
  rules: {
    indent: ['error', 'space'],
    'linebreak-style': ['error', 'unix'],
    quotes: ['error', 'double'],
    semi: ['error', 'always'],
    'max-line-length': [
      true,
      {
        limit: 120,
        'ignore-pattern': '^import |^export {(.*?)}',
      },
    ],
  },
  settings: {
    'svelte3/typescript': true, // load TypeScript as peer dependency
    // ...
  },
}
