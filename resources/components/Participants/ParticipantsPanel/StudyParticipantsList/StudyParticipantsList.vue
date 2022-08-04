<template>
  <v-skeleton-loader
    :loading="loading"
    type="list-item-two-line@5"
    class="fill-height"
  >
    <v-progress-linear v-if="fetchingMore" height="2" indeterminate />
    <v-virtual-scroll
      v-show="participants.length"
      v-resize="setHeight"
      :items="participants"
      :item-height="65"
      :min-height="350"
      :max-height="maxHeight"
      @scroll.native="scrolling"
    >
      <template #default="{ item }">
        <v-list-item>
          <v-list-item-content>
            <v-list-item-title v-text="item.name" />
            <v-list-item-subtitle v-text="item.identifier" />
            <queue-status
              :participant="item.id"
              :loading="loadingQueue"
              :position="queue[item.id]"
            />
          </v-list-item-content>
          <v-list-item-action v-if="editable" style="max-width: 100px">
            <priority-dial
              :participation="item.pivot"
              @changed-priority="$emit('changed-priority', $event)"
            />
          </v-list-item-action>
          <v-list-item-avatar>
            <progress-circle v-bind="progress(item)" :size="40" />
          </v-list-item-avatar>
        </v-list-item>
      </template>
    </v-virtual-scroll>
    <h3 v-show="!participants.length" class="px-4 font-weight-light">
      {{ $t('study_participants.participants.none') }}
    </h3>
  </v-skeleton-loader>
</template>

<script>
import { debounce } from 'lodash'
import QueueStatus from './QueueStatus/QueueStatus.vue'

export default {
  components: {
    ProgressCircle: () => import('@/components/common/ProgressCircle'),
    PriorityDial: () => import('@/components/Participants/ParticipantsPanel/PriorityDial'),
    QueueStatus
  },
  props: {
    participants: {
      type: Array,
      default: () => []
    },
    queue: {
      type: Object,
      default: () => ({})
    },
    loadingQueue: {
      type: [String, Number, Boolean],
      default: false
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
    },
    editable: {
      type: Boolean,
      default: false
    }
  },
  data: () => ({
    maxHeight: 400
  }),
  created () {
    this.scrolling = debounce(this.scrolling, 100)
  },
  mounted () {
    this.setHeight()
  },
  methods: {
    progress (ptcp) {
      return {
        value: this.totalJobs > 0
          ? parseInt((ptcp.pivot?.completed_jobs_count ?? 0) / this.totalJobs * 100)
          : 0
      }
    },
    setHeight () {
      this.maxHeight = this.$el.clientHeight - 40 || 400
    },
    scrolling (event) {
      const element = event.currentTarget || event.target
      if (element && element.scrollHeight - element.scrollTop === element.clientHeight) {
        this.$emit('scroll-end')
      }
    },
    queueStatus (ptcpID) {
      return {
        text: 'Queued at position 4',
        class: 'success--text'
      }
    }
  }
}
</script>
