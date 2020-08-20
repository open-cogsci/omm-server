<template>
  <v-container>
    <new-participant-dialog
      ref="dialog"
      v-model="dialog"
      :saving="saving"
      :errors.sync="errors"
      @save-participant="saveParticipant"
    />
    <v-row>
      <v-col cols="12" xl="8" offset-xl="2">
        <v-row>
          <v-col cols="12">
            <h1 class="text-h5 text-md-h4 font-weight-light">
              Participants
            </h1>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12">
            <v-skeleton-loader
              :loading="loading"
              type="table-row-divider@10"
            >
              <participants-list
                ref="list"
                :participants="participants"
                :saving="saving"
                :deleting="deleting"
                :errors.sync="errors"
                @update-participant="saveParticipant"
                @delete-participant="deleteParticipant"
              />
            </v-skeleton-loader>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
    <v-fab-transition>
      <v-btn
        v-if="$auth.user.user_type_id === 1"
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

export default {
  inject: ['theme'],
  components: {
    ParticipantsList: () => import('@/components/Participants/ParticipantsList'),
    newParticipantDialog: () => import('@/components/Participants/dialogs/NewParticipantDialog')
  },
  data () {
    return {
      dialog: false,
      saving: false,
      loading: false,
      deleting: false,
      fabVisible: false,
      errors: {},
      pagination: {
        page: 1,
        perPage: 20
      }
    }
  },
  computed: {
    Participant () {
      return this.$store.$db().model('participants')
    },
    participants () {
      return this.Participant.query()
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
    /*
    * Fetch participants from server
    */
    async loadParticipants () {
      this.loading = true
      try {
        this.pagination = await this.Participant.fetch({
          params: {
            studiescount: true,
            page: this.pagination.page,
            perPage: this.pagination.perPage
          }
        })
      } catch (e) {
        processErrors(e, this.notify)
      } finally {
        this.loading = false
      }
    },
    /**
     *  Save a participant
     */
    async saveParticipant (ptcpData) {
      this.saving = true
      try {
        await this.Participant.persist(pick(ptcpData, ['$id', 'id', 'name', 'identifier', 'active']))
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
    /*
    *
    */
    async deleteParticipant (ptcpID) {
      this.deleting = true
      try {
        await this.Participant.find(ptcpID).destroy()
        this.notify({ message: 'Participant has been deleted', color: 'success' })
      } catch (e) {
        this.errors = processErrors(e, this.notify)
      } finally {
        this.deleting = false
      }
    },
    /**
     *  Clear possible validation errors sent by adonis after closing the dialog.
     */
    clearErrors (val) {
      if (!val) {
        this.errors = { name: '', identifier: '' }
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
