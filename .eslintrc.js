module.exports = {
  root: true,
  env: {
    browser: true,
    node: true
  },
  globals: {
    use: true
  },
  parserOptions: {
    parser: 'babel-eslint',
    sourceType: 'module'
  },
  extends: [
    '@nuxtjs',
    'plugin:nuxt/recommended'
  ],
  // add your custom rules here
  rules: {
    'nuxt/no-cjs-in-config': 'off',
    'vue/script-setup-uses-vars': 'off'
  },
  ignorePatterns: ['resources/test/__snapshots__/**/*.js']
}
