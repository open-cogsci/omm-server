<template>
  <v-progress-circular v-bind="$props" :color="color" v-on="$listeners">
    {{ $attrs.value }}
  </v-progress-circular>
</template>

<script>
export default {
  props: {
    value: {
      type: Number,
      required: true
    }
  },
  computed: {
    color () {
      let color
      const value = this.value
      if (value >= 80) {
        color = 'green'
      } else if (value < 80 && value > 50) {
        color = 'green darken-2'
      } else {
        color = 'primary'
      }
      return color
    }
  }
}
</script>
