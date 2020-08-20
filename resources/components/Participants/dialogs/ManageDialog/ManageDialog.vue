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
      <v-card-title>Manage participants</v-card-title>
      <v-card-text class="body-1 font-weight-light">
        Assign participants to this study by choosing one of the following options:
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
                  Assign all participants
                </span>
                <span v-else>
                  Assign remaining participants
                </span>
              </v-btn>
              <span v-if="allSelected" class="ml-3 info--text">
                No more participants available
              </span>
            </v-col>
          </v-row>
          <v-expand-transition>
            <v-form v-show="!selected.length" v-model="randomValid">
              <v-row align="start" dense>
                <v-col cols="12" class="text-body-2">
                  Or randomly assign the following number of participants:
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
                    :rules="[v => v >= 1 || 'Please provide']"
                    single-line
                    type="number"
                  />
                </v-col>
                <v-col>
                  <v-btn :disabled="!randomValid || allSelected" @click="assignRandom">
                    Assign
                  </v-btn>
                </v-col>
              </v-row>
            </v-form>
          </v-expand-transition>
          <v-row>
            <v-col cols="12" class="text-body-2">
              Or manually select the participants:
            </v-col>
          </v-row>
          <v-row dense>
            <v-col cols="8">
              <v-text-field
                dense
                outlined
                hide-details
                label="Filter"
                prepend-inner-icon="mdi-magnify"
              />
            </v-col>
            <v-col cols="4">
              <v-select
                v-model="statusFilter"
                dense
                outlined
                hide-details
                label="Status"
                :items="['all','assigned','not assigned']"
              />
            </v-col>
            <v-col cols="12">
              <participant-selector
                v-if="value"
                :participants="participants"
                :selected.sync="selected"
              />
            </v-col>
          </v-row>
        </v-skeleton-loader>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn text @click="$emit('input', false)">
          Close
        </v-btn>
        <v-btn text color="success" :loading="applying" @click="checkBeforeApplying">
          <v-icon left>
            mdi-check
          </v-icon>
          Apply
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { mapActions } from 'vuex'
import { sampleSize, difference } from 'lodash'
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
      total: 0,
      loading: false,
      applying: false,
      statusFilter: 'all'
    }
  },
  computed: {
    Participant () {
      return this.$store.$db().model('participants')
    },
    participants () {
      return this.Participant.query().where('active', true).get()
    },
    allSelected () {
      return this.selected.length >= this.total
    }
  },
  watch: {
    async value (opened) {
      if (opened) {
        this.loading = true
        try {
          await this.Participant.fetch({ params: { no_paginate: true, only_active: true } })
          const { assigned, total } = await this.fetchParticipantIDs()
          this.originalSelection = this.selected = assigned
          this.total = total
        } catch (e) {
          processErrors(e, this.notify)
        } finally {
          this.loading = false
        }
      }
    }
  },
  methods: {
    ...mapActions('notifications', ['notify']),
    async fetchParticipantIDs () {
      if (!this.study) { return [] }
      return await this.study.fetchParticipantIDs()
    },
    assignAll () {
      this.selected = this.participants.map(ptcp => ptcp.id)
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
    }
  }
}
</script>
