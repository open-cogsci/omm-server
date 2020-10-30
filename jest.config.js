module.exports = {
  // globalSetup: '<rootDir>/resources/test/jestGlobalSetup.js',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/resources/$1',
    '^~/(.*)$': '<rootDir>/resources/$1',
    '^vue$': 'vue/dist/vue.common.js',
    '^.+.(css|styl|less|sass|scss|png|jpg|svg|ttf|woff|woff2)$': 'jest-transform-stub'
  },
  moduleFileExtensions: ['js', 'vue', 'json', 'ts'],
  transform: {
    '.*\\.(ts)$': 'ts-jest',
    '.*\\.(js)$': 'babel-jest',
    '.*\\.(vue)$': 'vue-jest',
    '.+\\.(css|styl|less|sass|scss|png|jpg|svg|ttf|woff|woff2)$': 'jest-transform-stub'
  },
  collectCoverage: true,
  collectCoverageFrom: [
    '<rootDir>/resources/components/**/*.vue',
    '<rootDir>/resources/pages/**/*.vue',
    '<rootDir>/resources/assets/js/**/*.js'
  ],
  setupFilesAfterEnv: [
    '<rootDir>/resources/test/jestSetup.js'
  ],
  transformIgnorePatterns: [
    'node_modules/(?!vue-router|@babel)'
  ],
  snapshotSerializers: ['jest-serializer-vue-tjw'],
  snapshotResolver: '<rootDir>/resources/test/snapshotResolver.js'
}
