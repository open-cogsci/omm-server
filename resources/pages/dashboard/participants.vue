<template>
  <v-container>
    <new-participant-dialog ref="dialog" />
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
          :participants="participants"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapActions } from 'vuex'
import { processErrors } from '@/assets/js/errorhandling'

import Participant from '@/models/Participant'

const emptyErrors = { name: '', rfid: '' }

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
      errors: { ...emptyErrors }
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
    this.loadParticipants()
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
    async saveNewStudy (newPtcpData) {
      this.saving = true
      try {
        await Participant.persist({
          name: newPtcpData.name,
          description: newPtcpData.description
        })
        this.notify({ message: 'Study has been added', color: 'success' })
        this.dialog = false
        this.$refs.dialog.clear()
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
        this.errors = { ...emptyErrors }
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
