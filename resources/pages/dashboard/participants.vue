<template>
  <v-container class="fill-height align-start">
    <new-participant-dialog
      ref="dialog"
      v-model="dialog"
      :saving="saving"
      :errors.sync="errors"
      @save-participant="saveParticipant"
    />
    <v-row class="fill-height">
      <v-col cols="12" xl="8" offset-xl="2" class="d-flex flex-column py-0">
        <v-row>
          <v-col cols="12">
            <h1 class="text-h5 text-md-h4 font-weight-light">
              {{ $t('layout.nav.participants') }}
            </h1>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12">
            <v-text-field
              v-model="searchterm"
              solo
              prepend-inner-icon="mdi-magnify"
              :placeholder="$t('participants.search')"
              hide-details
              clearable
              :loading="searching"
              @input="() => { pagination.page = 1; fetchParticipants() }"
            />
          </v-col>
        </v-row>
        <v-row class="fill-height">
          <v-col ref="items" cols="12">
            <v-skeleton-loader
              :loading="loading"
              type="table-row-divider@13"
            >
              <participants-list
                ref="list"
                :participants="participants"
                :saving="saving"
                :deleting="deleting"
                :errors.sync="errors"
                @update-participant="saveParticipant"
                @delete-participant="deleteParticipant"
                @load-participant="loadParticipant"
              />
            </v-skeleton-loader>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12">
            <v-pagination
              :value="pagination.page"
              :length="pagination.lastPage"
              @input="switchPage"
            />
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
        fixed
        @click="dialog=true"
      >
        <v-icon>mdi-plus</v-icon>
      </v-btn>
    </v-fab-transition>
  </v-container>
</template>

<script>
import { mapActions } from 'vuex'
import { pick, debounce, isString } from 'lodash'
import { processErrors } from '@/assets/js/errorhandling'

export default {
  // inject: ['theme'],
  components: {
    ParticipantsList: () => import('@/components/Participants/ParticipantsList'),
    newParticipantDialog: () => import('@/components/Participants/dialogs/NewParticipantDialog')
  },
  data () {
    return {
      searchterm: '',
      searching: false,
      dialog: false,
      saving: false,
      loading: false,
      loadingParticipant: 0,
      deleting: false,
      fabVisible: false,
      errors: {},
      pagination: {
        ids: [],
        page: 1,
        perPage: 12
      }
    }
  },
  computed: {
    Participant () {
      return this.$store.$db().model('participants')
    },
    participants () {
      return this.Participant.query()
        .with('studies.users')
        .orderBy('name', 'asc')
        .where('id', this.pagination.ids)
        .get()
    }
  },
  created () {
    this.fetchParticipants = debounce(this.fetchParticipants, 250)
  },
  mounted () {
    this.fabVisible = true
    const vh = this.$refs.items.clientHeight
    this.pagination.perPage = Math.floor(vh / 60)
    this.fetchParticipants()
  },
  methods: {
    ...mapActions('notifications', ['notify']),
    /*
    * Fetch participants from server
    */
    async fetchParticipants () {
      if (this.loading || this.searching) { return }
      try {
        const params = {
          studiescount: true,
          page: this.pagination.page,
          perPage: this.pagination.perPage
        }
        if (this.searchterm && this.searchterm.length >= 2) {
          params.q = this.searchterm
          params.page = 1
          this.searching = true
        } else {
          this.loading = true
        }
        this.pagination = await this.Participant.fetch({ params })
      } catch (e) {
        processErrors(e, this.notify)
      } finally {
        this.searching = false
        this.loading = false
      }
    },
    /** Load a single participant */
    async loadParticipant (id) {
      this.loadingParticipant = id
      try {
        await this.Participant.fetchById(id, {
          params: { study_progress: true }
        })
      } catch (e) {
        this.errors = processErrors(e, this.notify)
      }
      this.loadingParticipant = 0
    },
    /**
     *  Save a participant
     */
    async saveParticipant (ptcpData) {
      if (this.saving) { return }
      this.saving = true
      try {
        const payload = pick(ptcpData, ['$id', 'id', 'name', 'identifier', 'meta', 'active'])
        if (!isString(payload.meta)) {
          payload.meta = JSON.stringify(payload.meta)
        }
        const newRecord = await this.Participant.persist(payload)
        this.notify({ message: 'Participant has been saved', color: 'success' })
        if (ptcpData.id) {
          this.$refs.list.clearEditing()
        } else {
          this.dialog = false
          this.$refs.dialog.clear()
          this.pagination.ids.unshift(newRecord.response.data.data.id)
        }
      } catch (e) {
        this.errors = processErrors(e, this.notify)
      } finally {
        this.saving = false
      }
    },
    /*
    * Delete a participant
    */
    async deleteParticipant (ptcpID) {
      if (this.deleting) { return }
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
    /*
     * Switch page
     */
    switchPage (page) {
      if (page !== this.pagination.page) {
        this.pagination.page = page
        this.fetchParticipants()
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
