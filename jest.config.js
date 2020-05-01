module.exports = {
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/resources/$1',
    '^~/(.*)$': '<rootDir>/resources/$1',
    '^vue$': 'vue/dist/vue.common.js',
    '^.+.(css|styl|less|sass|scss|png|jpg|svg|ttf|woff|woff2)$': 'jest-transform-stub'
  },
  moduleFileExtensions: ['js', 'vue', 'json'],
  transform: {
    '.*\\.(j|t)s$': '<rootDir>/node_modules/babel-jest',
    '.*\\.(vue)$': '<rootDir>/node_modules/vue-jest',
    '.+\\.(css|styl|less|sass|scss|png|jpg|svg|ttf|woff|woff2)$': 'jest-transform-stub'
  },
  collectCoverage: true,
  collectCoverageFrom: [
    '<rootDir>/resources/components/**/*.vue',
    '<rootDir>/resources/pages/**/*.vue'
  ],
  setupFilesAfterEnv: [
    '<rootDir>/resources/test/jestSetup.js'
  ],
  transformIgnorePatterns: [
    'node_modules/(?!vue-router)'
  ]
}
