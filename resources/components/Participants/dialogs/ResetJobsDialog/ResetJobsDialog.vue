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
    },
    finishedJobs: {
      type: Array,
      default: () => []
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
    value (val) {
      if (val) {
        this.showConfirmation = false
      }
    },
    finishedJobs: {
      handler (newVal) {
        this.dialogFinishedJobs = newVal || []
        this.selectedJobs = []
        this.selectAll = false
      },
      immediate: true
    },
    selectedJobs (val) {
      this.selectAll = val.length === this.dialogFinishedJobs.length && this.dialogFinishedJobs.length > 0
    }
  },
  methods: {
    ...mapActions('notifications', ['notify']),

    async fetchFinishedJobs () {
      if (!this.participant) {
        return
      }
      this.loading = true
      try {
        const response = await this.$axios.get(
          `${API_PREFIX}/participants/${this.participant.identifier}/${this.studyId}/jobs`
        )
        this.dialogFinishedJobs = response.data.data.filter(
          job => job.pivot && job.pivot.status_id === 3
        )
        this.selectedJobs = []
        this.selectAll = false
      } catch (e) {
        processErrors(e, this.notify)
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
        const positions = this.dialogFinishedJobs
          .filter(j => this.selectedJobs.includes(j.id))
          .map(j => j.position)

        const minPos = Math.min(...positions)
        const maxPos = Math.max(...positions)

        await this.$axios.put(
          `${API_PREFIX}/studies/${this.studyId}/jobs/state`,
          {
            from: minPos,
            to: maxPos + 1,
            state: 1,
            participant: this.participant.identifier
          }
        )

        this.notify({
          message: this.$t('participants.jobs.reset.success', { count: this.selectedJobs.length }),
          color: 'success'
        })

        this.$emit('jobs-reset')
        this.close()
      } catch (e) {
        processErrors(e, this.notify)
      } finally {
        this.loading = false
      }
    },

    close () {
      this.$emit('input', false)
    }
  }
}
</script>
