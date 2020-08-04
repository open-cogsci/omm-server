<template>
  <fragment>
    <upload-experiment-dialog
      v-model="dialog.uploadExp"
      @upload="uploadExperiment"
    />
    <upload-jobs-dialog v-model="dialog.uploadJobs" />
    <collaborators-dialog v-model="dialog.collaborators" />
    <v-container>
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
              @clicked-delete="deleteStudy"
              @clicked-archive="archiveStudy"
              @clicked-upload-exp="dialog.uploadExp = true"
              @clicked-upload-jobs="dialog.uploadJobs = true"
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
          <v-col cols="12" class="pt-6">
            <v-tabs-items v-model="tab">
              <v-tab-item>
                <jobs-table
                  :study="study"
                  :loading="loading"
                  @updated-order="updateJobsOrder"
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
          name: '', description: ''
        }
      },
      loading: false,
      tab: 0,
      dialog: {
        uploadExp: false,
        uploadJobs: false,
        collaborators: false
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
        .with(['variables.dtype', 'users', 'participants'])
        .with(['jobs'], (query) => {
          query.orderBy('position', 'asc')
            .with('variables.dtype')
        })
        .first()
    }
  },
  created () {
    this.fetchStudy(this.$route.params.id)
  },
  methods: {
    ...mapActions('notifications', ['notify']),
    async fetchStudy (studyId) {
      this.loading = true
      try {
        await this.Study.fetchById(studyId)
      } catch (e) {
        processErrors(e, this.notify)
      } finally {
        this.loading = false
      }
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
    async uploadExperiment () {

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
      this.fetchStudy(to.params.id)
    }
    next()
  },
  head () {
    return {
      title: 'Study -- ' + this.study?.name || 404
    }
  }
}
</script>
