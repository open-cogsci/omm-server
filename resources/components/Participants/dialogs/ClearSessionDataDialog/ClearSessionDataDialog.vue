<template>
  <v-dialog
    persistent
    :value="value"
    max-width="650px"
    @input="$emit('input', $event)"
  >
    <confirmation-dialog
      v-model="confirmDialog"
      @clicked-no="confirmDialog = false"
      @clicked-yes="clearSessionData"
    >
      {{ $t('study_participants.dialogs.clear_session_data.confirm') }}
    </confirmation-dialog>
    <v-card>
      <v-card-title>{{ $t('study_participants.dialogs.clear_session_data.title') }}</v-card-title>
      <v-card-text class="body-1 font-weight-light">
        {{ $t('study_participants.dialogs.clear_session_data.subtitle') }}:
      </v-card-text>
      <v-card-text>
        <v-skeleton-loader
          :loading="loading"
          type="list-item,list-item,list-item-two-line@3"
        >
          <v-row dense>
            <v-col cols="8">
              <v-text-field
                v-model="searchterm"
                dense
                outlined
                hide-details
                :label="$t('study_participants.dialogs.manage.filter.label')"
                clearable
                prepend-inner-icon="mdi-magnify"
                @input="fetchAfterFilter"
              />
            </v-col>
            <v-col cols="12">
              <div style="height: 2px">
                <v-progress-linear v-show="fetchingMore" height="2" indeterminate />
              </div>
              <participant-selector
                v-if="value"
                :participants="participants"
                :selected.sync="selected"
                @scroll-end="fetchMore"
              />
            </v-col>
          </v-row>
        </v-skeleton-loader>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn text @click="$emit('input', false)">
          {{ $t('buttons.close') }}
        </v-btn>
        <v-btn
          text
          color="error"
          :loading="clearing"
          :disabled="!selected.length"
          @click="confirmDialog = true"
        >
          <v-icon left>
            mdi-delete
          </v-icon>
          {{ $t('buttons.clear') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { mapActions } from 'vuex'
import { debounce } from 'lodash'
import { processErrors } from '@/assets/js/errorhandling'
import { SESSIONS } from '@/assets/js/endpoints'

const EMPTY_VALUES = {
  searchterm: null,
  selected: [],
  loading: false,
  fetchingMore: false,
  clearing: false,
  pagination: {
    page: 1,
    perPage: 50,
    lastPage: 1
  }
}

export default {
  components: {
    ParticipantSelector: () => import('@/components/Participants/ParticipantsPanel/ParticipantSelector'),
    ConfirmationDialog: () => import('@/components/common/ConfirmationDialog')
  },
  props: {
    value: {
      type: Boolean,
      default: false
    },
    study: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      confirmDialog: false,
      ...EMPTY_VALUES,
      sessionParticipantIds: []
    }
  },
  computed: {
    participantModel () {
      return this.$store.$db().model('participants')
    },
    participants () {
      const allParticipants = this.participantModel ? this.participantModel.query().where('active', true).get() || [] : []
      if (this.sessionParticipantIds.length === 0) {
        return []
      }
      return allParticipants.filter(p => this.sessionParticipantIds.includes(p.id))
    }
  },
  watch: {
    async value (opened) {
      if (opened) {
        this.resetData()
        this.loading = true
        try {
          await this.fetchParticipants()
          await this.fetchSessionParticipantIds()
          const { assigned } = await this.study.fetchParticipantIDs()
          this.selected = [...assigned].filter(id => this.sessionParticipantIds.includes(id))
        } catch (e) {
          processErrors(e, this.notify, true)
        } finally {
          this.loading = false
        }
      }
    }
  },
  created () {
    this.fetchParticipants = debounce(this.fetchParticipants, 250)
  },
  methods: {
    ...mapActions('notifications', ['notify']),
    resetData () {
      this.searchterm = EMPTY_VALUES.searchterm
      this.selected = EMPTY_VALUES.selected
      this.pagination = { ...EMPTY_VALUES.pagination }
      this.sessionParticipantIds = []
    },
    async fetchSessionParticipantIds () {
      try {
        const response = await this.participantModel.api().get(`${SESSIONS}/list`, {
          params: { study_id: this.study.id },
          save: false
        })
        const sessions = response?.response?.data?.data || response?.data?.data || []
        const participantIdentifiers = sessions.map(s => s.participant_id)
        const allParticipants = this.participantModel.query().get() || []
        this.sessionParticipantIds = allParticipants
          .filter(p => participantIdentifiers.includes(p.identifier))
          .map(p => p.id)
      } catch (e) {
        // Silently handle - participants list will be empty
      }
    },
    async fetchParticipants (options = {}) {
      if (this.fetchingMore) { return }
      this.fetchingMore = true
      try {
        const params = {
          page: this.pagination.page,
          perPage: this.pagination.perPage,
          only_active: true,
          assigned_to_study: this.study.id,
          q: this.searchterm
        }
        this.pagination = await this.participantModel.fetch({ params, ...options })
      } catch (e) {
        processErrors(e, this.notify, true)
      } finally {
        this.fetchingMore = false
      }
    },
    async clearSessionData () {
      this.confirmDialog = false
      this.clearing = true
      try {
        const participants = this.participantModel.query()
          .whereIdIn(this.selected)
          .get()
        const identifiers = participants.map(p => p.identifier)
        for (const participantId of identifiers) {
          await this.participantModel.api().delete(SESSIONS, {
            params: {
              study_id: this.study.id,
              participant_id: participantId
            },
            save: false
          })
        }
        this.notify({ message: 'Session data cleared successfully', color: 'success' })
        this.$emit('cleared')
        this.$emit('input', false)
      } catch (e) {
        processErrors(e, this.notify)
      } finally {
        this.clearing = false
      }
    },
    fetchMore () {
      if (this.pagination.page < this.pagination.lastPage) {
        this.fetchParticipants({
          params: {
            page: this.pagination.page + 1,
            perPage: this.pagination.perPage
          }
        })
      }
    },
    async fetchAfterFilter () {
      await this.$nextTick()
      this.pagination.page = 1
      this.fetchParticipants()
    }
  }
}
</script>
