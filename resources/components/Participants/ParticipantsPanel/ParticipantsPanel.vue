<template>
  <v-row id="participants-panel" class="fill-height">
    <data-download-dialog
      v-model="dialog.download"
      :files="study.files"
      :generating="loading.data"
      @generate="generateDataFile"
    />
    <manage-dialog
      v-model="dialog.manage"
      :study="study"
      @new-assignments="refreshParticipants"
    />
    <v-col
      cols="12"
      lg="6"
      xl="7"
      class="pb-5"
    >
      <v-card outlined class="fill-height d-flex flex-column">
        <v-card-title>
          {{ $t('study_participants.stats.title') }}
        </v-card-title>
        <v-card-text>
          <participation-stats :data="stats" />
        </v-card-text>
      </v-card>
    </v-col>
    <v-col
      cols="12"
      lg="6"
      xl="5"
      class="pb-5"
    >
      <v-card outlined class="fill-height d-flex flex-column">
        <v-card-title>
          {{ $t('study_participants.participants.title') }}
          <v-spacer />
          <span class="caption">
            {{ $t('study_participants.participants.perc_complete') }}
          </span>
        </v-card-title>
        <v-card-text class="pa-0 fill-height">
          <study-participants-list
            :total-jobs="study.jobs_count"
            :participants="participants"
            :loading="loading.initial"
            :fetching-more="loading.participants"
            @scroll-end="loadMore"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            :disabled="study.completed_jobs_count < 1"
            color="primary"
            :loading="!!loading.data"
            @click="dialog.download = true"
          >
            <v-icon left>
              mdi-download
            </v-icon>
            {{ $t('study_participants.participants.data') }}
          </v-btn>
          <v-btn
            color="primary"
            @click="dialog.manage = true"
          >
            <v-icon left>
              mdi-account-group
            </v-icon>
            {{ $t('study_participants.participants.manage') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
import { mapActions } from 'vuex'
import { processErrors } from '@/assets/js/errorhandling'
export default {
  components: {
    ParticipationStats: () => import('./ParticipationStats'),
    StudyParticipantsList: () => import('./StudyParticipantsList'),
    DataDownloadDialog: () => import('@/components/Participants/dialogs/DataDownloadDialog'),
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
        stats: false,
        data: null
      },
      pagination: {
        page: 1,
        lastPage: 1,
        perPage: 50,
        total: 0
      },
      ptcpListCtrHeight: 0,
      stats: {}
    }
  },
  computed: {
    Participant () {
      return this.$store.$db().model('participants')
    },
    participants () {
      return this.study?.participants || []
    }
  },
  watch: {
    study (val, oldVal) {
      if (!val || val.id === oldVal?.id) {
        return
      }
      this.fetchParticipants()
      this.fetchStats()
    }
  },
  async mounted () {
    this.loading.initial = true
    await this.fetchParticipants()
    await this.fetchStats()
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
    async fetchStats () {
      if (!this.study?.id) { return }
      this.loading.stats = true
      try {
        this.stats = await this.study.fetchParticipationStats()
      } catch (e) {
        processErrors(e, this.notify)
      } finally {
        this.loading.stats = false
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
    refreshParticipants () {
      this.fetchParticipants({
        params: {
          page: 1,
          perPage: this.pagination.perPage
        }
      })
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
    }
  }
}
</script>
