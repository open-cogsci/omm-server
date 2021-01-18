<template>
  <v-list-item-subtitle v-bind="decorations">
    <div v-if="loading === 'all' || loading === 1" class="pr-5">
      <v-progress-linear
        class="d-inline-block"
        height="1px"
        indeterminate
      />
    </div>
    <span v-else>
      {{ message }}
    </span>
  </v-list-item-subtitle>
</template>

<script>
export default {
  props: {
    position: {
      type: Object,
      default: () => ({
        participant_id: 0,
        queue_position: -1
      })
    },
    loading: {
      type: [String, Number, Boolean],
      default: false
    }
  },
  computed: {
    message () {
      if (this.position.queue_position > 1) {
        return `Queued at position ${this.position.queue_position - 1}`
      } else {
        return 'First to run'
      }
    },
    decorations () {
      return {
        class: this.position.queue_position > 1
          ? 'primary--text'
          : 'success--text'
      }
    }
  }
}
</script>
