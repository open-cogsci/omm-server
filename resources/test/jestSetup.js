import Vue from 'vue'
import Vuetify from 'vuetify'
import { config } from '@vue/test-utils'

Vue.use(Vuetify)

Vue.mixin({
  beforeCreate () {
    const sync = this.$options.sync
    if (sync) {
      if (!this.$options.computed) {
        this.$options.computed = {}
      }
      const attrs = Object.keys(this.$attrs)
      sync.forEach((key) => {
        if (!attrs.includes(key)) {
          Vue.util.warn(`Missing required sync-prop: "${key}"`, this)
        }
        this.$options.computed[key] = {
          get () {
            return this.$attrs[key]
          },
          set (val) {
            this.$emit('update:' + key, val)
          }
        }
      })
    }
  }
})

config.mocks.$t = key => key

const vuetify = new Vuetify({
  mocks: {
    $vuetify: {
      breakpoint: {}
    }
  }
})

export const commonVueParams = {
  vuetify
}
