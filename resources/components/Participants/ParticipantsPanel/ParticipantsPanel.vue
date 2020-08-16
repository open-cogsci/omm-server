<template>
  <v-row>
    <v-col cols="12" sm="6" md="12" lg="6">
      <v-card outlined>
        <v-card-title>
          Stats
        </v-card-title>
        <v-card-text>
          <participation-stats />
        </v-card-text>
      </v-card>
    </v-col>
    <v-col cols="12" sm="6" md="12" lg="6">
      <v-card outlined>
        <v-card-title>
          Participants
        </v-card-title>
        <v-card-text class="px-0">
          <study-participants-list
            :participants="participants"
            :loading="loading.participants"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            v-if="participants.length"
            color="primary"
            :loading="loading.data"
            @click="downloadStudyData"
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
    StudyParticipantsList: () => import('./StudyParticipantsList')
  },
  props: {
    study: {
      type: Object,
      default: () => null
    }
  },
  data () {
    return {
      loading: {
        participants: false,
        stats: false,
        data: false
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
    async downloadStudyData (format = 'csv') {
      this.loading.data = true
      try {
        const blob = await this.study.downloadData({ params: { format } })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', `data.${format}`)
        document.body.appendChild(link)
        link.click()
        setTimeout(() => document.body.removeChild(link), 10 * 1000)
      } catch (e) {
        processErrors(e, this.notify)
      } finally {
        this.loading.data = false
      }
    }
  }
}
</script>
