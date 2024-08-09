<template>
  <v-row id="participants-panel" class="fill-height">
    <manage-dialog
      v-model="dialog.manage"
      :study="study"
      @new-assignments="refresh"
    />
    <v-col
      cols="12"
      class="pb-5"
    >
      <v-card outlined class="fill-height d-flex flex-column">
        <v-card-actions>
          <v-spacer />
          <v-btn
            v-if="userCanEdit"
            color="primary"
            @click="dialog.manage = true"
          >
            <v-icon left>
              mdi-account-group
            </v-icon>
            {{ $t('study_participants.participants.manage') }}
          </v-btn>
        </v-card-actions>
    <v-card-title>
      {{ $t('study_participants.participants.title') }}
      <v-spacer />
      <div v-if="participants.length">
        <span class="caption mr-6">
          Priority
        </span>
        <span class="caption">
          {{ $t('study_participants.participants.perc_complete') }}
        </span>
      </div>
    </v-card-title>
    <v-card-text class="pa-0 fill-height">
      <study-participants-list
        :editable="userCanEdit"
        :total-jobs="study.jobs_count"
        :participants="participants"
        :queue="queue"
        :loading-queue="loading.queue"
        :loading="loading.initial"
        :fetching-more="loading.participants"
        @changed-priority="fetchQueue"
        @scroll-end="loadMore"
      />
    </v-card-text>
  </v-card>
    </v-col>
  </v-row>
</template>

<script>
import { mapActions } from 'vuex'
import { keyBy } from 'lodash'
import { processErrors } from '@/assets/js/errorhandling'

export default {
  components: {
    StudyParticipantsList: () => import('./StudyParticipantsList'),
    ManageDialog: () => import('@/components/Participants/dialogs/ManageDialog')
  },
  props: {
    study: {
      type: Object,
      default: () => null
    },
    // This prop is necessary for v-virtual-scroll to render its contents correctly.
    // If the tab becomes active, force a rerender of its contents
    visible: {
      type: Boolean,
      default: () => false
    }
  },
  data () {
    return {
      dialog: {
        download: false,
        manage: false
      },
      loading: {
        initial: false,
        participants: false,
        queue: false,
        data: null
      },
      pagination: {
        page: 1,
        lastPage: 1,
        perPage: 50,
        total: 0
      },
      ptcpListCtrHeight: 0,
      queue: {}
    }
  },
  computed: {
    Participant () {
      return this.$store.$db().model('participants')
    },
    participants () {
      return this.study?.participants || []
    },
    userCanEdit () {
      return !!this.study?.users.find(user => user.id === this.$auth.user.id &&
        user.pivot.access_permission_id === 2)
    }
  },
  watch: {
    study (val, oldVal) {
      if (!val || val.id === oldVal?.id) {
        return
      }
      this.fetchParticipants()
      this.fetchQueue()
    }
  },
  async mounted () {
    this.setStartpage()
    this.loading.initial = true
    await this.fetchParticipants()
    await this.fetchQueue()
    this.loading.initial = false
  },
  methods: {
    ...mapActions('notifications', ['notify']),
    async fetchParticipants (options = {}) {
      if (!this.study?.id || this.loading.participants) { return }
      this.loading.participants = true
      try {
        this.pagination = await this.study.fetchParticipants({
          params: {
            page: this.pagination.page,
            perPage: this.pagination.perPage
          },
          ...options
        })
      } catch (e) {
        processErrors(e, this.notify)
      } finally {
        this.loading.participants = false
      }
    },
    async fetchQueue (ptcpID = null) {
      if (!this.study?.id) { return }
      this.loading.queue = ptcpID ?? 'all'
      try {
        const results = await this.study.fetchParticipantQueuePositions(ptcpID)
        this.queue = {
          ...this.queue,
          ...keyBy(results, 'participant_id')
        }
      } catch (e) {
        processErrors(e, this.notify)
      } finally {
        this.loading.queue = false
      }
    },
    async generateDataFile (format) {
      this.loading.data = format
      try {
        await this.study.generateDataFile({ params: { format } })
      } catch (e) {
        processErrors(e, this.notify)
      } finally {
        this.loading.data = null
      }
    },
    refresh () {
      this.fetchParticipants({
        params: {
          page: 1,
          perPage: this.pagination.perPage
        }
      })
      this.fetchQueue()
    },
    setPtcpListCtrHeight () {
      this.ptcpListCtrHeight = this.$refs.ptcpListContainer?.clientHeight || 0
    },
    loadMore () {
      if (this.participants.length < this.pagination.total) {
        this.fetchParticipants({
          params: {
            page: this.pagination.page + 1,
            perPage: this.pagination.perPage
          }
        })
      }
    },
    setStartpage () {
      this.pagination.page = Math.max(1, Math.ceil(this.participants.length / this.pagination.perPage))
    }
  }
}
</script>
