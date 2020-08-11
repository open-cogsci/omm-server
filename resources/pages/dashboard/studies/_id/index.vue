<template>
  <fragment>
    <upload-experiment-dialog
      v-model="dialog.uploadExp"
      :previous-file="osexpFile"
      :upload-status="uploading.experiment"
      @upload="file => upload('experiment', file)"
      @clicked-cancel="cancelUpload('experiment')"
    />
    <upload-jobs-dialog
      v-model="dialog.uploadJobs"
      :previous-file="jobsFile"
      :upload-status="uploading.jobs"
      @upload="file => upload('jobs', file)"
      @clicked-cancel="cancelUpload('jobs')"
    />
    <collaborators-dialog
      v-if="userIsOwner"
      v-model="dialog.collaborators"
      :users="study && study.users"
    />
    <v-container class="py-0 my-0">
      <v-row dense>
        <v-col cols="12">
          <study-title
            :study="study"
            :saving="saving.title"
            :loading="loading"
            :errors.sync="errors.title"
            @editted="saveTitleInfo"
          />
        </v-col>
      </v-row>

      <template v-if="loading || study">
        <v-row no-gutters>
          <v-col cols="12" lg="9" class="text-md-right">
            <study-actions
              :loading="loading"
              :study="study"
              :jobs="jobs"
              :user-is-owner="userIsOwner"
              @clicked-delete="deleteStudy"
              @clicked-archive="archiveStudy"
              @clicked-upload-exp="openUploadExpDialog"
              @clicked-upload-jobs="openUploadJobsDialog"
              @clicked-collaborators="dialog.collaborators = true"
            />
          </v-col>
          <v-col cols="12" lg="3" order-lg="first">
            <v-tabs v-model="tab">
              <v-tab>Jobs</v-tab>
              <v-tab>Participants</v-tab>
            </v-tabs>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12" class="pt-6 pb-0 mb-0">
            <v-tabs-items v-model="tab">
              <v-tab-item>
                <jobs-table
                  :variables="variables"
                  :jobs="jobs"
                  :loading="loading"
                  :refreshing="refreshingJobs"
                  :total-records="pagination.total"
                  :page="pagination.page"
                  :per-page="pagination.perPage"
                  @update:page="updatePage"
                  @update:per-page="updatePerPage"
                  @update:order="updateJobsOrder"
                />
              </v-tab-item>
              <v-tab-item>
                <v-card flat>
                  <v-card-text>Participants</v-card-text>
                </v-card>
              </v-tab-item>
            </v-tabs-items>
          </v-col>
        </v-row>
      </template>
    </v-container>
  </fragment>
</template>

<script>
import { pick } from 'lodash'
import { mapActions } from 'vuex'
import isFunction from 'lodash/isFunction'
import { processErrors } from '@/assets/js/errorhandling'

export default {
  name: 'Study',
  components: {
    StudyTitle: () => import('@/components/Studies/page/StudyTitle'),
    StudyActions: () => import('@/components/Studies/page/StudyActions'),
    JobsTable: () => import('@/components/Studies/page/JobsTable'),
    UploadExperimentDialog: () => import('@/components/Studies/dialogs/UploadExperimentDialog'),
    UploadJobsDialog: () => import('@/components/Studies/dialogs/UploadJobsDialog'),
    CollaboratorsDialog: () => import('@/components/Studies/dialogs/CollaboratorsDialog')
  },
  data () {
    return {
      saving: {
        title: false
      },
      errors: {
        title: {
          name: '',
          description: ''
        }
      },
      pagination: {
        page: 1,
        lastPage: 1,
        perPage: 10,
        total: 0,
        pageStart: 0,
        pageStop: 10
      },
      loading: false,
      refreshingJobs: false,
      tab: 0,
      dialog: {
        uploadExp: false,
        uploadJobs: false,
        collaborators: false
      },
      uploading: {
        experiment: {
          inProgress: false,
          progress: null,
          cancel: null,
          file: null
        },
        jobs: {
          inProgress: false,
          progress: null,
          cancel: null,
          file: null
        }
      }
    }
  },
  computed: {
    Study () {
      return this.$store.$db().model('studies')
    },
    Job () {
      return this.$store.$db().model('jobs')
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
      return (!this.loading && this.study?.variables) || []
    },
    osexpFile () {
      return this.study?.files.filter(fl => fl.type === 'experiment')[0]
    },
    jobsFile () {
      return this.study?.files.filter(fl => fl.type === 'jobs')[0]
    },
    userIsOwner () {
      return !!this.study?.users.find(user => user.id === this.$auth.user.id && user.pivot.is_owner)
    }
  },
  async created () {
    await this.fetchAll(this.$route.params.id)
  },
  methods: {
    ...mapActions('notifications', ['notify']),
    async fetchStudy (studyID) {
      try {
        await this.Study.fetchById(studyID)
      } catch (e) {
        processErrors(e, this.notify)
      }
    },
    async fetchJobs (studyID) {
      this.refreshingJobs = true
      try {
        const response = await this.Job.fetchByStudyId(
          studyID, { params: pick(this.pagination, ['page', 'perPage']) }
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
      this.loading = true
      await this.fetchStudy(studyID)
      await this.fetchJobs(studyID)
      this.loading = false
    },
    async saveTitleInfo (data) {
      const payload = {
        ...pick(this.study, ['id', 'name', 'description']),
        ...data
      }
      this.saving.title = true
      try {
        await this.Study.persist(payload)
        this.errors.title = {}
      } catch (e) {
        this.errors.title = processErrors(e, this.notify)
      } finally {
        this.saving.title = false
      }
    },
    async deleteStudy () {
      try {
        await this.study.destroy()
        this.notify({ message: 'Study deleted', color: 'success' })
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
        this.notify({ message: 'Study status changed', color: 'success' })
      } catch (e) {
        processErrors(e, this.notify)
      }
    },
    openUploadExpDialog () {
      this.uploading.experiment.progress = null
      this.dialog.uploadExp = true
    },
    openUploadJobsDialog () {
      this.uploading.jobs.progress = null
      this.dialog.uploadJobs = true
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
        try {
          this.notify({
            message: 'Refreshing jobs',
            color: 'info'
          })
          this.refreshingJobs = true
          await this.study.refreshJobs()
        } catch (e) {
          processErrors(e, this.notify)
        } finally {
          this.refreshingJobs = false
        }
      }
    },
    cancelUpload (item) {
      if (isFunction(this.uploading[item].cancel)) {
        this.uploading[item].cancel('Upload canceled')
      }
    },
    updatePage (val) {
      this.pagination.page = val
      return this.fetchJobs(this.study.id)
    },
    updatePerPage (val) {
      this.pagination.perPage = val
      return this.fetchJobs(this.study.id)
    },
    resetPagination () {
      this.pagination = {
        page: 1,
        lastPage: 1,
        perPage: 10,
        total: 0,
        pageStart: 0,
        pageStop: 10
      }
    }
  },
  validate ({ params }) {
    // Must be a number
    return /^\d+$/.test(params.id)
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
  head () {
    return {
      title: 'Study -- ' + this.study?.name || 404
    }
  }
}
</script>
