<template>
  <v-container class="py-0 my-0 fill-height align-start">
    <upload-experiment-dialog
      v-model="uploading.experiment.dialog"
      :previous-file="osexpFile"
      :upload-status="uploading.experiment"
      @upload="file => upload('experiment', file)"
      @clicked-cancel="cancelUpload('experiment')"
    />
    <upload-jobs-dialog
      v-model="uploading.jobs.dialog"
      :previous-file="jobsFile"
      :upload-status="uploading.jobs"
      @upload="file => upload('jobs', file)"
      @clicked-cancel="cancelUpload('jobs')"
    />
    <collaborators-dialog
      v-if="userIsOwner"
      v-model="collaborators.dialog"
      :users="study && study.users"
      :search-field.sync="collaborators.searchField"
      :searching-users="collaborators.searching"
      :search-results="collaborators.searchResults"
      :saving="collaborators.saving"
      :deleting="collaborators.deleting"
      :saving-access="collaborators.savingAccess"
      @query="searchUsers"
      @add-user="addCollaborator"
      @remove-user="removeCollaborator"
      @set-access-level="setAccessLevel"
    />
    <v-row class="fill-height" no-gutters>
      <v-col cols="12" class="d-flex flex-column py-0">
        <v-row dense>
          <v-col cols="12">
            <study-title
              :study="study"
              :saving="status.savingStudyInfo"
              :loading="status.loading"
              :errors.sync="errors.title"
              :editable="userCanEdit"
              @editted="saveStudyInfo"
            />
          </v-col>
        </v-row>

        <template v-if="status.loading || study">
          <v-row no-gutters>
            <v-col cols="12" lg="8" xl="9" class="text-md-right">
              <study-actions
                :loading="status.loading"
                :study="study"
                :jobs="jobs"
                :user-can-edit="userCanEdit"
                :user-is-owner="userIsOwner"
                @clicked-delete="deleteStudy"
                @clicked-archive="archiveStudy"
                @clicked-upload-exp="openUploadExpDialog"
                @clicked-upload-jobs="openUploadJobsDialog"
                @clicked-collaborators="collaborators.dialog = true"
              />
            </v-col>
            <v-col cols="12" lg="4" xl="3" order-lg="first">
              <v-tabs v-model="tab">
                <v-tab>{{ $t('studies.tabs.information') }}</v-tab>
                <v-tab>{{ $t('studies.tabs.jobs') }}</v-tab>
                <v-tab>{{ $t('studies.tabs.participants') }}</v-tab>
                <v-tab>{{ $t('studies.tabs.stats') }}</v-tab>
              </v-tabs>
            </v-col>
          </v-row>
          <v-row class="fill-height">
            <v-col cols="12" class="pt-6 pb-0 mb-0">
              <v-tabs-items v-model="tab" class="fill-height">
                <v-tab-item class="fill-height">
                  <v-row justify="center" class="fill-height">
                    <v-col xl="10">
                      <v-card outlined class="fill-height">
                        <v-card-text>
                          <study-info
                            :loading="status.loading"
                            :user-can-edit="userCanEdit"
                            :study="study"
                            @editted="saveStudyInfo"
                          />
                        </v-card-text>
                      </v-card>
                    </v-col>
                  </v-row>
                </v-tab-item>
                <v-tab-item>
                  <jobs-table
                    :editable="userCanEdit"
                    :variables="variables"
                    :jobs="jobs"
                    :loading="status.loading"
                    :refreshing="status.refreshingJobs"
                    :total-records="pagination.total"
                    :page="pagination.page"
                    :per-page="pagination.perPage"
                    @update:page="updatePage"
                    @update:per-page="updatePerPage"
                    @update:order="updateJobsOrder"
                  />
                </v-tab-item>
                <v-tab-item class="fill-height">
                  <participants-panel
                    ref="ptcpPanel"
                    :visible="ptcpPanelVisible"
                    :study="study"
                  />
                </v-tab-item>
                <v-tab-item>
                  <participation-stats
                    ref="participationStats"
                    :visible="participationStatsVisible"
                    :study="study"
                  />
                </v-tab-item>
              </v-tabs-items>
            </v-col>
          </v-row>
        </template>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { pick, debounce, isFunction } from 'lodash'
import { mapActions } from 'vuex'
import { sync } from 'vuex-pathify'
import { processErrors } from '@/assets/js/errorhandling'
import StudyActions from '@/components/Studies/page/StudyActions'
import StudyInfo from '@/components/Studies/page/StudyInfo'

const defaultPagination = {
  page: 1,
  lastPage: 1,
  perPage: 10,
  total: 0,
  pageStart: 0,
  pageStop: 10
}

export default {
  name: 'StudyPage',
  components: {
    StudyActions,
    StudyTitle: () => import('@/components/Studies/page/StudyTitle'),
    JobsTable: () => import('@/components/Studies/page/JobsTable'),
    UploadExperimentDialog: () => import('@/components/Studies/dialogs/UploadExperimentDialog'),
    UploadJobsDialog: () => import('@/components/Studies/dialogs/UploadJobsDialog'),
    CollaboratorsDialog: () => import('@/components/Studies/dialogs/CollaboratorsDialog'),
    ParticipantsPanel: () => import('@/components/Participants/ParticipantsPanel'),
    ParticipationStats: () => import('@/components/Participants/ParticipationStats'),
    StudyInfo
  },
  beforeRouteUpdate (to, from, next) {
    // The component is reused if the id simply changed, so mounted is not called in this case.
    // Force a refetch if the id has changed.
    if (to.params.id !== from.params.id) {
      this.fetchAll(to.params.id)
    }
    this.resetPagination()
    next()
  },
  validate ({ params }) {
    // Must be a number
    return /^\d+$/.test(params.id)
  },
  data () {
    return {
      status: {
        savingStudyInfo: false,
        savingInfo: false,
        loading: false,
        refreshingJobs: false
      },
      errors: {
        title: {
          name: '',
          description: ''
        }
      },
      pagination: { ...defaultPagination },
      collaborators: {
        dialog: false,
        searchField: false,
        searching: false,
        saving: false,
        savingAccess: null,
        searchTerm: '',
        searchResults: []
      },
      uploading: {
        experiment: {
          dialog: false,
          inProgress: false,
          progress: null,
          cancel: null,
          file: null
        },
        jobs: {
          dialog: false,
          inProgress: false,
          progress: null,
          cancel: null,
          file: null
        }
      }
    }
  },
  head () {
    return {
      title: 'Study -- ' + this.study?.name || 404
    }
  },
  computed: {
    tab: sync('studyTab'),
    participationStatsVisible () {
      return this.tab === 1
    },
    ptcpPanelVisible () {
      return this.tab === 1
    },
    Study () {
      return this.$store.$db().model('studies')
    },
    Job () {
      return this.$store.$db().model('jobs')
    },
    User () {
      return this.$store.$db().model('users')
    },
    study () {
      return this.Study.query()
        .where('id', parseInt(this.$route.params.id))
        .with(['variables.dtype', 'users', 'participants', 'files'])
        .first()
    },
    jobs () {
      if (!this.study?.id) {
        return []
      }
      return this.Job.query()
        .where('study_id', this.study.id)
        .orderBy('position', 'asc')
        .where('position',
          value => value > this.pagination.pageStart && value <= this.pagination.pageStop)
        .with('variables.dtype')
        .get()
    },
    variables () {
      return (!this.status.loading && this.study?.variables) || []
    },
    osexpFile () {
      return this.study?.files.filter(fl => fl.type === 'experiment')[0]
    },
    jobsFile () {
      return this.study?.files.filter(fl => fl.type === 'jobs')[0]
    },
    userIsOwner () {
      return !!this.study?.users.find(user => user.id === this.$auth.user.id && user.pivot.is_owner)
    },
    userCanEdit () {
      return !!this.study?.users.find(user => user.id === this.$auth.user.id &&
        user.pivot.access_permission_id === 2)
    }
  },
  async created () {
    this.searchUsers = debounce(this.searchUsers, 250)
    await this.fetchAll(this.$route.params.id)
  },
  methods: {
    ...mapActions('notifications', ['notify']),
    async fetchStudy (studyID, options) {
      try {
        await this.Study.fetchById(studyID, {
          persistOptions: {
            create: ['users']
          },
          ...options
        })
      } catch (e) {
        processErrors(e, this.notify, true)
      }
    },
    async fetchJobs (studyID, options) {
      this.refreshingJobs = true
      try {
        const response = await this.Job.fetchByStudyId(
          studyID,
          {
            params: pick(this.pagination, ['page', 'perPage']),
            ...options
          }
        )
        const serverPagination = response.response.data.pagination
        const pageStart = (serverPagination.page - 1) * serverPagination.perPage
        const pageStop = serverPagination.page * serverPagination.perPage
        this.pagination = {
          ...this.pagination,
          ...serverPagination,
          pageStart,
          pageStop
        }
      } catch (e) {
        processErrors(e, this.notify)
      } finally {
        this.refreshingJobs = false
      }
    },
    async fetchAll (studyID) {
      this.status.loading = true
      await this.fetchStudy(studyID)
      await this.fetchJobs(studyID)
      this.status.loading = false
    },
    async saveStudyInfo (data) {
      const payload = {
        ...pick(this.study, ['id', 'name', 'description', 'information']),
        ...data
      }
      this.status.savingStudyInfo = true
      try {
        await this.Study.persist(payload)
        this.errors.title = {}
      } catch (e) {
        this.errors.title = processErrors(e, this.notify)
      } finally {
        this.status.savingStudyInfo = false
      }
    },
    async deleteStudy () {
      try {
        await this.study.destroy()
        this.notify({ message: this.$t('studies.notifications.deleted'), color: 'success' })
        this.$router.replace(this.localePath({ name: 'dashboard-studies' }))
      } catch (e) {
        processErrors(e, this.notify)
      }
    },
    async updateJobsOrder (newOrder) {
      try {
        await this.Job.update(newOrder)
      } catch (e) {
        processErrors(e, this.notify)
      }
    },
    async archiveStudy () {
      try {
        await this.study.toggleArchived()
        this.notify({ message: this.$t('studies.notifications.archived'), color: 'success' })
      } catch (e) {
        processErrors(e, this.notify)
      }
    },
    async upload (type, file) {
      this.uploading[type].inProgress = true
      const CancelToken = this.$axios.CancelToken

      try {
        this.uploading[type].progress = 0
        await this.study.upload(type, file, {
          cancelToken: new CancelToken((c) => {
            this.uploading[type].cancel = c
          }),
          onUploadProgress: (event) => {
            this.uploading[type].progress = event.loaded / event.total * 100
          }
        })
        this.uploading[type].progress = 100
      } catch (e) {
        if (!e.__CANCEL__) {
          processErrors(e, this.notify)
        }
        this.uploading[type].progress = -1
      } finally {
        this.uploading[type].inProgress = false
        this.uploading[type].cancel = null
      }

      if (type === 'jobs') {
        this.notify({
          message: this.$t('studies.notifications.refreshing_jobs'),
          color: 'info'
        })
        this.resetPagination()
        await this.fetchStudy(this.study.id, {
          persistOptions: {
            create: ['users', 'variables']
          }
        })
        this.fetchJobs(this.study.id, { refresh: true })
        if (this.$refs.ptcpPanel) {
          this.$refs.ptcpPanel.refresh()
        }
      }
    },
    async searchUsers (val) {
      if (this.collaborators.searching) { return }
      this.collaborators.searching = true
      this.collaborators.searchResults = await this.User.search(val)
      this.collaborators.searching = false
    },
    async addCollaborator (userID) {
      this.collaborators.saving = true
      try {
        await this.study.addUser(userID)
        this.collaborators.searchField = false
      } catch (e) {
        processErrors(e, this.notify)
      } finally {
        this.collaborators.saving = false
      }
    },
    async setAccessLevel (payload) {
      try {
        this.collaborators.savingAccess = payload.userID
        await this.study.setAccessLevel(payload)
      } catch (e) {
        processErrors(e, this.notify)
      } finally {
        this.collaborators.savingAccess = null
      }
    },
    async removeCollaborator (userID) {
      this.collaborators.deleting = userID
      try {
        await this.study.deleteUser(userID)
      } catch (e) {
        processErrors(e, this.notify)
      } finally {
        this.collaborators.deleting = null
      }
    },
    cancelUpload (item) {
      if (isFunction(this.uploading[item].cancel)) {
        this.uploading[item].cancel(this.$t('studies.notifications.upload_canceled'))
      }
    },
    openUploadExpDialog () {
      this.uploading.experiment.progress = null
      this.uploading.experiment.dialog = true
    },
    openUploadJobsDialog () {
      this.uploading.jobs.progress = null
      this.uploading.jobs.dialog = true
    },
    updatePage (val) {
      this.pagination.page = val
      this.fetchJobs(this.study.id)
    },
    updatePerPage (val) {
      this.pagination.perPage = val
      this.fetchJobs(this.study.id)
    },
    resetPagination () {
      this.pagination = { ...defaultPagination }
    }
  }
}
</script>
