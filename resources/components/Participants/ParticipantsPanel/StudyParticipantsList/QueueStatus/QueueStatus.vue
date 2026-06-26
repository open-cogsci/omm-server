<template>
  <v-list-item-subtitle v-bind="decorations">
    <div v-if="loading === 'all' || loading === participant" class="pr-5">
      <v-progress-linear
        class="d-inline-block"
        height="2px"
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
    participant: {
      type: Number,
      required: true
    },
    status: {
      type: Number,
      default: null
    },
    loading: {
      type: [String, Number, Boolean],
      default: false
    }
  },
  computed: {
    message () {
      if (this.status === 3) {
        return this.$t('participants.priority.finished')
      }
      if (this.position.queue_position > 1) {
        return this.$t('participants.priority.queued') + ` ${this.position.queue_position - 1}`
      } else {
        return this.$t('participants.priority.first')
      }
    },
    decorations () {
      if (this.status === 3) {
        return { class: 'grey--text text--disabled' }
      }
      return {
        class: this.position.queue_position > 1
          ? 'primary--text'
          : 'success--text'
      }
    }
  }
}
</script>
