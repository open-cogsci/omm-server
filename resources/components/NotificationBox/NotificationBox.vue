<template>
  <v-snackbar
    :value="current.value"
    bottom
    left
    :color="current.color"
    :timeout="current.timeout"
    @input="pop"
  >
    {{ current.message }}
    <template v-slot:action="{ attrs }">
      <v-btn text v-bind="attrs" @click="pop">
        {{ current.closeText }}
      </v-btn>
    </template>
  </v-snackbar>
</template>

<script>
import { mapState, mapActions } from 'vuex'

export default {
  computed: {
    ...mapState('notifications', ['current'])
  },
  methods: {
    ...mapActions('notifications', ['pop'])
  }
}
</script>
