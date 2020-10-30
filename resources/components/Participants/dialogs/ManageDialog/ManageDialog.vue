<template>
  <v-dialog
    persistent
    :value="value"
    max-width="650px"
    @input="$emit('input', $event)"
  >
    <confirmation-dialog
      v-model="warningDialog"
      @clicked-no="deselected = []; warningDialog = false"
      @clicked-yes="apply"
    >
      You have deselected {{ deselected.length }} participants. For these participants,
      any results will be erased. Are you sure you want to continue?
    </confirmation-dialog>
    <v-card>
      <v-card-title>{{ $t('study_participants.dialogs.manage.title') }}</v-card-title>
      <v-card-text class="body-1 font-weight-light">
        {{ $t('study_participants.dialogs.manage.subtitle') }}:
      </v-card-text>
      <v-card-text>
        <v-skeleton-loader
          :loading="loading"
          type="list-item,list-item,list-item-two-line@3"
        >
          <v-row class="mb-4" align="center">
            <v-col cols="12">
              <v-btn :disabled="allSelected" @click="assignAll">
                <span v-if="!selected.length">
                  {{ $t('study_participants.dialogs.manage.buttons.assign_all') }}
                </span>
                <span v-else>
                  {{ $t('study_participants.dialogs.manage.buttons.assign_remaining') }}
                </span>
              </v-btn>
              <span v-if="allSelected" class="ml-3 info--text">
                {{ $t('study_participants.dialogs.manage.no_available_ptcps') }}
              </span>
            </v-col>
          </v-row>
          <v-expand-transition>
            <v-form v-show="!selected.length" v-model="randomValid">
              <v-row align="start" dense>
                <v-col cols="12" class="text-body-2">
                  {{ $t('study_participants.dialogs.manage.assign_random') }}
                </v-col>
                <v-col cols="6" sm="3" lg="2">
                  <v-text-field
                    v-model="N"
                    :disabled="allSelected"
                    class="mt-0 pt-0"
                    dense
                    solo
                    min="1"
                    :max="participants.length || 1"
                    :rules="[v => v >= 1 || $t('study_participants.dialogs.manage.provide') ]"
                    single-line
                    type="number"
                  />
                </v-col>
                <v-col>
                  <v-btn :disabled="!randomValid || allSelected" @click="assignRandom">
                    {{ $t('study_participants.dialogs.manage.buttons.assign') }}
                  </v-btn>
                </v-col>
              </v-row>
            </v-form>
          </v-expand-transition>
          <v-row>
            <v-col cols="12" class="text-body-2">
              {{ $t('study_participants.dialogs.manage.manually_select') }}:
            </v-col>
          </v-row>
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
            <v-col cols="4">
              <v-select
                v-model="statusFilter"
                dense
                outlined
                hide-details
                :label="$t('study_participants.dialogs.manage.filter.status')"
                :items="filterItems"
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
        <v-btn text color="success" :loading="applying" @click="checkBeforeApplying">
          <v-icon left>
            mdi-check
          </v-icon>
          {{ $t('buttons.apply') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { mapActions } from 'vuex'
import { sampleSize, difference, debounce } from 'lodash'
import { processErrors } from '@/assets/js/errorhandling'

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
      warningDialog: false,
      randomValid: true,
      N: 1,
      originalSelection: [],
      selected: [],
      deselected: [],
      allIDs: [],
      total: 0,
      loading: false,
      fetchingMore: false,
      applying: false,
      statusFilter: 'all',
      searchterm: null,
      pagination: {
        page: 1,
        perPage: 50,
        lastPage: 10
      }
    }
  },
  computed: {
    Participant () {
      return this.$store.$db().model('participants')
    },
    participants () {
      const query = this.Participant.query().where('active', true)
      if (this.statusFilter === 'assigned') {
        query.whereIdIn(this.selected)
      } else if (this.statusFilter === 'not assigned') {
        query.whereIdIn(difference(this.allIDs, this.selected))
      }
      if (this.searchterm && this.searchterm.length > 2) {
        query.where((ptcp) => {
          return ptcp.name.includes(this.searchterm) || ptcp.identifier.includes(this.searchterm)
        })
      }
      return query.get()
    },
    allSelected () {
      return this.selected.length >= this.total
    },
    filterItems () {
      return [
        {
          value: 'all',
          text: this.$t('study_participants.dialogs.manage.filter.all')
        },
        {
          value: 'assigned',
          text: this.$t('study_participants.dialogs.manage.filter.assigned')
        },
        {
          value: 'not assigned',
          text: this.$t('study_participants.dialogs.manage.filter.not_assigned')
        }
      ]
    }
  },
  watch: {
    async value (opened) {
      if (opened) {
        this.searchterm = null
        this.loading = true
        try {
          this.fetchParticipants()
          const { assigned, all, total } = await this.fetchParticipantIDs()
          this.originalSelection = [...assigned]
          this.selected = [...assigned]
          this.allIDs = all
          this.total = total
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
  mounted () {
    this.setStartpage()
  },
  methods: {
    ...mapActions('notifications', ['notify']),
    setStartpage () {
      this.pagination.page = Math.max(1, Math.ceil(this.participants.length / this.pagination.perPage))
    },
    async fetchParticipants (options = {}) {
      if (this.fetchingMore) { return }
      this.fetchingMore = true
      try {
        const params = {
          page: this.pagination.page,
          perPage: this.pagination.perPage,
          only_active: true,
          q: this.searchterm
        }
        if (this.statusFilter !== 'all') {
          const filterParam = this.statusFilter === 'assigned'
            ? 'assigned_to_study'
            : 'not_assigned_to_study'
          params[filterParam] = this.study.id
        }
        this.pagination = await this.Participant.fetch({ params, ...options })
      } catch (e) {
        processErrors(e, this.notify, true)
      } finally {
        this.fetchingMore = false
      }
    },
    async fetchParticipantIDs () {
      if (!this.study) { return [] }
      return await this.study.fetchParticipantIDs()
    },
    assignAll () {
      this.selected = [...this.allIDs]
    },
    assignRandom () {
      this.selected = sampleSize(
        this.participants.map(ptcp => ptcp.id),
        Math.min(this.N, this.participants.length)
      )
    },
    checkBeforeApplying () {
      const deselected = difference(this.originalSelection, this.selected)
      if (deselected.length > 0) {
        this.deselected = deselected
        this.warningDialog = true
      } else {
        this.apply()
      }
    },
    async apply () {
      this.warningDialog = false
      const newlySelected = difference(this.selected, this.originalSelection)
      // If there are no new selections or deselections, there is nothing to do
      if (!newlySelected.length && !this.deselected.length) {
        this.notify({ message: 'No changes to apply', color: 'info' })
        return this.$emit('input', false)
      }
      this.applyng = true
      try {
        if (newlySelected.length) {
          await this.study.assignParticipants(newlySelected)
        }
        if (this.deselected.length) {
          await this.study.revokeParticipants(this.deselected)
        }
        this.notify({ message: 'Participant assignments saved', color: 'success' })
        this.newlySelected = []
        this.deselected = []
        if (this.newlySelected) {
          this.$emit('new-assignments')
        }
        this.$emit('input', false)
      } catch (e) {
        processErrors(e, this.notify)
      } finally {
        this.applyng = false
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
      // Wait a bit for the participants collection to be filtered, so its length can be used
      // in the execution of setStartpage
      await this.$nextTick()
      this.setStartpage()
      this.fetchParticipants()
    }
  }
}
</script>
