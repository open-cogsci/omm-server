<template>
  <v-skeleton-loader
    :loading="loading"
    type="list-item-two-line@5"
  >
    <v-virtual-scroll
      v-if="participants.length"
      ref="scroller"
      :items="participants"
      :item-height="65"
      :min-height="350"
      :max-height="height"
    >
      <template v-slot="{ item }">
        <v-list-item>
          <v-list-item-content>
            <v-list-item-title v-text="item.name" />
            <v-list-item-subtitle v-text="item.identifier" />
          </v-list-item-content>
          <v-list-item-avatar>
            <job-progress v-bind="progress(item)" :size="40" />
          </v-list-item-avatar>
        </v-list-item>
      </template>
    </v-virtual-scroll>
    <h3 v-else class="px-4 font-weight-light">
      No participants to show
    </h3>
  </v-skeleton-loader>
</template>

<script>
export default {
  components: {
    JobProgress: () => import('../JobProgress')
  },
  props: {
    participants: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    },
    totalJobs: {
      type: Number,
      default: 0
    },
    height: {
      type: Number,
      default: 0
    }
  },
  methods: {
    progress (ptcp) {
      const value = this.totalJobs > 0
        ? parseInt(ptcp.completed_jobs_count / this.totalJobs * 100)
        : 0

      let color
      if (value >= 80) {
        color = 'green'
      } else if (value < 80 && value > 50) {
        color = 'green darken-2'
      } else {
        color = 'primary'
      }

      return {
        value, color
      }
    }
  }
}
</script>
