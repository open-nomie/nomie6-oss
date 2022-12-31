module.exports = {
  transformIgnorePatterns: ['/node_modules/(?!my-package)(.*)'],
  presets: [
    [
      '@babel/preset-env',
      'babel-plugin-transform-vite-meta-env',
      {
        targets: {
          node: 'current',
        },
      },
    ],
  ],
}
