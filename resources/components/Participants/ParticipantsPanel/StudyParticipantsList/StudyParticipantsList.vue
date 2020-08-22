<template>
  <v-skeleton-loader
    :loading="loading"
    type="list-item-two-line@5"
    class="fill-height"
  >
    <v-progress-linear v-if="fetchingMore" height="2" indeterminate />
    <v-virtual-scroll
      v-if="participants.length"
      v-resize="setHeight"
      :items="participants"
      :item-height="65"
      :min-height="350"
      :max-height="maxHeight"
      @scroll.native="scrolling"
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
import { debounce } from 'lodash'

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
    fetchingMore: {
      type: Boolean,
      default: false
    },
    totalJobs: {
      type: Number,
      default: 0
    }
  },
  data: () => ({
    maxHeight: 400
  }),
  created () {
    this.scrolling = debounce(this.scrolling, 200)
  },
  mounted () {
    this.setHeight()
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
    },
    setHeight () {
      this.maxHeight = this.$el.clientHeight - 30 || 400
    },
    scrolling (event) {
      const element = event.currentTarget || event.target
      if (element && element.scrollHeight - element.scrollTop === element.clientHeight) {
        this.$emit('scroll-end')
      }
    }
  }
}
</script>
