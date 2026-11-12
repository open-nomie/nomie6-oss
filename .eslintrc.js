module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: ['eslint:recommended'],
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
  },
  rules: {
    'indent': ['warn', 2],
    'linebreak-style': ['warn', 'unix'],
    'quotes': ['warn', 'double'],
    'semi': ['warn', 'always'],
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
  },
  overrides: [
    {
      files: ['*.svelte'],
      processor: 'svelte3/svelte3',
      rules: {
        'indent': 'off',
      },
    },
    {
      files: ['*.spec.js', '*.test.js'],
      rules: {
        'quotes': 'off',
        'semi': 'off',
      },
    },
  ],
  plugins: ['svelte3'],
  settings: {
    'svelte3/typescript': true,
  },
};
