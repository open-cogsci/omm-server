module.exports = {
  parsePages: false,
  lazy: true,
  langDir: 'lang/',
  seo: false, // change this back to true once https://github.com/nuxt-community/nuxt-i18n/issues/100 has been fixed
  locales: [
    {
      code: 'en',
      iso: 'en-US',
      name: 'English',
      file: 'en-US.js'
    },
    {
      code: 'nl',
      iso: 'nl-NL',
      name: 'Nederlands',
      file: 'nl-NL.js'
    },
    {
      code: 'fr',
      iso: 'fr-FR',
      name: 'Francais',
      file: 'fr-FR.js'
    }
  ],
  defaultLocale: 'en',
  vueI18n: {
    fallbackLocale: 'en'
  }
}
