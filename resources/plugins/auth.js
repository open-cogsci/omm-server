// runtimeConfigurableScheme.js

// This auth plugin will end up in .nuxt/auth/schemes, as will oauth2.js if it's
// also a registered strategy in the module config.
import Auth0Scheme from '@nuxtjs/auth-next/dist/providers/auth0/scheme'
export default class RuntimeConfigurableAuth0Scheme extends Auth0Scheme {
  constructor ($auth, options) {
    const configOptions = {
      ...options,
      ...$auth.ctx.$config.auth.strategies[options.name]
    }
    super($auth, configOptions)
  }
}
