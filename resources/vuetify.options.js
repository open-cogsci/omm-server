import colors from 'vuetify/lib/util/colors'

import en from 'vuetify/es5/locale/en'
import nl from 'vuetify/es5/locale/nl'
import fr from 'vuetify/es5/locale/fr'

// vuetify.options.js
export default function ({ app }) {
  return {
    breakpoint: {},
    icons: {},
    lang: {
      locales: { en, fr, nl },
      current: 'en'
    },
    theme: {
      dark: false,
      themes: {
        light: {
          primary: colors.blue.darken2,
          accent: colors.orange.accent4,
          secondary: colors.blueGrey.lighten2,
          info: colors.teal.lighten2,
          warning: colors.amber.base,
          error: colors.deepOrange.accent4,
          success: colors.green.base
        }
      }
    }
  }
}
