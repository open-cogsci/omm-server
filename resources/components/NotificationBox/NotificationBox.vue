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
    <v-btn text @click.native="pop">
      {{ current.closeText }}
    </v-btn>
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
