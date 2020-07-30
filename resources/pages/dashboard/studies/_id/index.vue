<template>
  <div :key="(study && study.id) || 'not-initialized'">
    <upload-experiment-dialog v-model="dialog.uploadExp" />
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
      <template v-if="study">
        <v-row no-gutters>
          <v-col cols="12" lg="9" class="text-md-right">
            <study-actions
              :loading="loading"
              :osexp-present="!!study.osexp_path"
              :jobs-present="!!study.jobs.length"
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
          <v-col cols="12">
            <v-tabs-items v-model="tab">
              <v-tab-item>
                <v-card flat>
                  <v-card-text>
                    <jobs-table :data="jobsTable" />
                  </v-card-text>
                </v-card>
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
  </div>
</template>

<script>
import { mapActions } from 'vuex'
import { pick } from 'lodash'
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
    study () {
      return this.Study.query()
        .where('id', parseInt(this.$route.params.id))
        .with(['variables', 'users', 'participants'])
        .with(['jobs'], (query) => {
          query.orderBy('position', 'asc')
            .with('variables.dtype')
        })
        .first()
    },
    jobsTable () {
      // Temporary fix for nasty Vuex-ORM bug
      const results = {}
      if (this.study) {
        for (const job of this.study.jobs) {
          results[job.id] = pick(job, ['id', 'position'])
          results[job.id].variables = {}
          for (const variable of job.variables) {
            const pivot = variable.value(job.id)
            results[job.id].variables[variable.id] = {
              name: variable.name,
              value: pivot.value,
              pivot
            }
          }
        }
      }
      return results
    }
  },
  mounted () {
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
    async archiveStudy () {
      // await this.study.toggleArchived()
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
