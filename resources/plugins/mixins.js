import Vue from 'vue'
import camelCase from 'lodash/camelCase'

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
        this.$options.computed[camelCase(key)] = {
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
