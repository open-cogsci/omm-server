<template>
  <v-text-field
    ref="field"
    v-model="priority"
    dense
    outlined
    type="number"
    hide-details
    :rules="[v => !!v && v > 0 && v < 100]"
    min="1"
    max="99"
  />
</template>

<script>
import { mapActions } from 'vuex'
import { isArray, debounce } from 'lodash'
import { processErrors } from '~/assets/js/errorhandling'

export default {
  props: {
    participation: {
      type: Object,
      required: true
    }
  },
  computed: {
    priority: {
      get () {
        return this.participation.priority
      },
      set (val) {
        if (!this.$refs.field.validate()) {
          return
        }
        this.update(val)
      }
    }
  },
  created () {
    this.update = debounce(this.update, 500)
  },
  methods: {
    ...mapActions('notifications', ['notify']),
    async update (val) {
      try {
        await this.participation.setPriority(val)
      } catch (e) {
        if (isArray(e.response.data)) {
          this.notify({ message: e.response.data[0].message, color: 'error' })
        } else {
          processErrors(e, this.notfiy)
        }
      }
    }
  }
}
</script>
