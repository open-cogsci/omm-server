<template>
  <v-dialog
    :value="value"
    max-width="500px"
    persistent
    @input="$emit('input', $event)"
  >
    <v-card>
      <v-card-title>
        {{ $t('participants.jobs.reset.title') }}
      </v-card-title>
      <v-card-text class="body-1">
        <div v-if="showConfirmation">
          <p class="mb-4">
            {{ $t('participants.jobs.reset.confirm_message', { count: selectedJobs.length }) }}
          </p>
          <v-alert type="warning" dense>
            {{ $t('participants.jobs.reset.warning') }}
          </v-alert>
        </div>
        <div v-else>
          <p class="mb-4">
            {{ $t('participants.jobs.reset.description', { participant: participantName }) }}
          </p>

          <v-progress-linear v-if="loading" indeterminate class="mb-4" />

          <div v-else-if="dialogFinishedJobs.length === 0">
            {{ $t('participants.jobs.reset.no_finished') }}
          </div>

          <v-list v-else dense max-height="300px" class="overflow-y-auto">
            <v-list-item>
              <v-list-item-action>
                <v-checkbox
                  v-model="selectAll"
                  hide-details
                  @change="toggleAll"
                />
              </v-list-item-action>
              <v-list-item-content>
                <v-list-item-title>{{ $t('participants.jobs.reset.select_all') }}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>

            <v-list-item v-for="job in dialogFinishedJobs" :key="job.id">
              <v-list-item-action>
                <v-checkbox
                  v-model="selectedJobs"
                  :value="job.id"
                  hide-details
                />
              </v-list-item-action>
              <v-list-item-content>
                <v-list-item-title>Job {{ job.position }}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </div>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn
          text
          @click="showConfirmation ? (showConfirmation = false) : close()"
        >
          {{ showConfirmation ? $t('buttons.cancel') : $t('buttons.cancel') }}
        </v-btn>
        <v-btn
          v-if="showConfirmation"
          color="error"
          :loading="loading"
          @click="confirmReset"
        >
          {{ $t('participants.jobs.reset.confirm_button') }}
        </v-btn>
        <v-btn
          v-else
          color="primary"
          :loading="loading"
          :disabled="selectedJobs.length === 0"
          @click="showConfirmation = true"
        >
          {{ $t('participants.jobs.reset.button') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { mapActions } from 'vuex'
import { API_PREFIX } from '@/assets/js/endpoints'
import { processErrors } from '@/assets/js/errorhandling'

export default {
  props: {
    value: {
      type: Boolean,
      default: false
    },

    studyId: {
      type: Number,
      required: true
    },

    participant: {
      type: [Object, null],
      default: null
    }
  },
  data () {
    return {
      loading: false,
      dialogFinishedJobs: [],
      selectedJobs: [],
      selectAll: false,
      showConfirmation: false
    }
  },
  computed: {
    participantName () {
      return this.participant?.identifier || this.participant?.name || ''
    }
  },
  watch: {
    value (isOpen) {
      if (isOpen) {
        this.onOpen()
      } else {
        this.onClose()
      }
    },

    selectedJobs (val) {
      this.selectAll =
        this.dialogFinishedJobs.length > 0 &&
        val.length === this.dialogFinishedJobs.length
    }
  },
  methods: {
    ...mapActions('notifications', ['notify']),

    async fetchFinishedJobs () {
      if (
        !this.studyId ||
        !this.participant?.id
      ) {
        return
      }

      this.loading = true

      try {
        const response = await this.$axios.get(
          `${API_PREFIX}/studies/${this.studyId}` +
          `/participants/${this.participant.id}` +
          '/finished-jobs'
        )

        this.dialogFinishedJobs =
          response.data.data || []

        this.selectedJobs = []
        this.selectAll = false
      } catch (e) {
        processErrors(
          e,
          this.notify
        )

        this.close()
      } finally {
        this.loading = false
      }
    },

    toggleAll () {
      if (this.selectAll) {
        this.selectedJobs = this.dialogFinishedJobs.map(j => j.id)
      } else {
        this.selectedJobs = []
      }
    },

    async confirmReset () {
      if (this.selectedJobs.length === 0) {
        return
      }

      this.loading = true

      try {
        const response = await this.$axios.put(
          `${API_PREFIX}/studies/${this.studyId}` +
          `/participants/${this.participant.id}` +
          '/jobs/reset',
          {
            job_ids: this.selectedJobs
          }
        )

        const jobsUpdated =
          response.data?.data?.jobs_updated ??
          this.selectedJobs.length

        this.notify({
          message: this.$t(
            'participants.jobs.reset.success',
            {
              count: jobsUpdated
            }
          ),
          color: 'success'
        })

        this.$emit('jobs-reset')

        this.close()
      } catch (e) {
        processErrors(
          e,
          this.notify
        )
      } finally {
        this.loading = false
      }
    },

    close () {
      this.$emit('input', false)
    },

    async onOpen () {
      this.showConfirmation = false
      this.selectedJobs = []
      this.selectAll = false
      this.dialogFinishedJobs = []

      await this.fetchFinishedJobs()
    },

    onClose () {
      this.showConfirmation = false
      this.selectedJobs = []
      this.selectAll = false
      this.dialogFinishedJobs = []
    }
  }
}
</script>
