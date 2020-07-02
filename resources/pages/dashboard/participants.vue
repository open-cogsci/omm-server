<template>
  <v-container>
    <new-participant-dialog
      ref="dialog"
      v-model="dialog"
      :saving="saving"
      :errors="errors"
      @save-participant="saveParticipant"
    />
    <v-row>
      <v-col cols="12">
        <h1 class="display-1 font-weight-light">
          Participants
        </h1>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12" xl="8" offset-xl="2">
        <participants-list
          ref="list"
          :participants="participants"
          @update-participant="saveParticipant"
        />
      </v-col>
    </v-row>
    <v-fab-transition>
      <v-btn
        v-show="fabVisible"
        class="mb-12"
        color="accent"
        fab
        large
        dark
        bottom
        right
        absolute
        @click="dialog=true"
      >
        <v-icon>mdi-plus</v-icon>
      </v-btn>
    </v-fab-transition>
  </v-container>
</template>

<script>
import { mapActions } from 'vuex'
import { pick } from 'lodash'
import { processErrors } from '@/assets/js/errorhandling'

import Participant from '@/models/Participant'

export default {
  components: {
    ParticipantsList: () => import('@/components/Participants/ParticipantsList'),
    newParticipantDialog: () => import('@/components/Participants/NewParticipantDialog')
  },
  data () {
    return {
      dialog: false,
      saving: false,
      loading: false,
      fabVisible: false,
      errors: {}
    }
  },
  computed: {
    participants () {
      return Participant.query()
        .orderBy('name', 'asc')
        .get()
    }
  },
  created () {
    this.clearErrors(false)
    this.loadParticipants()
  },
  mounted () {
    this.fabVisible = true
  },
  methods: {
    ...mapActions('notifications', ['notify']),
    async loadParticipants () {
      this.loading = true
      try {
        await Participant.fetch()
      } catch (e) {
        processErrors(e, this.notify)
      } finally {
        this.loading = false
      }
    },
    /**
     *  Save a study
     */
    async saveParticipant (ptcpData) {
      this.saving = true
      try {
        await Participant.persist(pick(ptcpData, ['$id', 'id', 'name', 'rfid', 'active']))
        this.notify({ message: 'Participant has been saved', color: 'success' })
        if (ptcpData.id) {
          this.$refs.list.clearEditing()
        } else {
          this.dialog = false
          this.$refs.dialog.clear()
        }
      } catch (e) {
        this.errors = processErrors(e, this.notify)
      } finally {
        this.saving = false
      }
    },
    /**
     *  Clear possible validation errors sent by adonis after closing the dialog.
     */
    clearErrors (val) {
      if (!val) {
        this.errors = { name: '', rfid: '' }
      }
    }
  },
  head () {
    return {
      title: 'Participants'
    }
  }
}
</script>
