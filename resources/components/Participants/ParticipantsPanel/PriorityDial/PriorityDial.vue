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
      async set (val) {
        if (!this.$refs.field.validate()) {
          return
        }
        try {
          await this.participation.setPriority(val)
        } catch (e) {
          this.notify({ message: e.response.data[0].message, color: 'error' })
        }
      }
    }
  },
  methods: {
    ...mapActions('notifications', ['notify'])
  }
}
</script>
