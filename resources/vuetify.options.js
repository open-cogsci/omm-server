import colors from 'vuetify/lib/util/colors'

// vuetify.options.js
export default {
  breakpoint: {},
  icons: {},
  lang: {},
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
