module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    jest: true
  },
  globals: {
    use: true
  },
  parserOptions: {
    parser: 'babel-eslint'
  },
  plugins: [
    'vuetify'
  ],
  extends: [
    '@nuxtjs',
    'plugin:nuxt/recommended',
    'plugin:vue/recommended'
  ],
  // add your custom rules here
  rules: {
    'nuxt/no-cjs-in-config': 'off',
    'vuetify/no-deprecated-classes': 'error',
    'vuetify/grid-unknown-attributes': 'error',
    'vuetify/no-legacy-grid': 'error',
  }
}
