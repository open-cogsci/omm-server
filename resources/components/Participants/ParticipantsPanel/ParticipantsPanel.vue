<template>
  <v-row>
    <data-download-dialog
      v-model="dialog.download"
      :files="study.files"
      :generating="loading.data"
      @generate="generateDataFile"
    />
    <v-col cols="12" sm="6" md="12" lg="6" xl="7">
      <v-card outlined>
        <v-card-title>
          Stats
        </v-card-title>
        <v-card-text>
          <participation-stats />
        </v-card-text>
      </v-card>
    </v-col>
    <v-col cols="12" sm="6" md="12" lg="6" xl="5">
      <v-card outlined>
        <v-card-title>
          Participants
          <v-spacer />
          <span class="caption">% jobs completed</span>
        </v-card-title>
        <v-card-text class="px-0">
          <study-participants-list
            ref="ptcpList"
            :key="study.id"
            :total-jobs="study.jobs_count"
            :participants="participants"
            :loading="loading.participants"
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
            Data
          </v-btn>
          <v-btn color="primary">
            <v-icon left>
              mdi-account-group
            </v-icon>
            Manage
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
    DataDownloadDialog: () => import('@/components/Participants/dialogs/DataDownloadDialog')
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
        download: false
      },
      loading: {
        participants: false,
        stats: false,
        data: null
      },
      pagination: {
        page: 1,
        lastPage: 1,
        perPage: 10,
        total: 0
      }
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
      // this.fetchStats()
    }
  },
  mounted () {
    this.fetchParticipants()
  },
  methods: {
    ...mapActions('notifications', ['notify']),
    async fetchParticipants (page, perPage) {
      if (!this.study?.id) { return }
      this.loading.participants = true
      try {
        this.pagination = await this.Participant.fetchForStudy(
          this.study.id, {
            params: {
              page: page || this.pagination.page,
              perPage: perPage || this.pagination.perPage
            }
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
        await this.study.fetchParticipationStats()
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
    }
  }
}
</script>
