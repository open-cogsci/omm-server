<template>
  <v-container :key="(study && study.id) || 'not-initialized'">
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
        <v-col cols="12" class="text-md-right">
          <study-actions
            :loading="loading"
            :osexp-present="!!study.osexp_path"
            @clicked-delete="deleteStudy"
            @clicked-archive="archiveStudy"
          />
        </v-col>
      </v-row>
    </template>
  </v-container>
</template>

<script>
import { mapActions } from 'vuex'
import { pick } from 'lodash'
import Study from '@/models/Study'
import { processErrors } from '@/assets/js/errorhandling'

export default {
  name: 'Study',
  components: {
    StudyTitle: () => import('@/components/Studies/page/StudyTitle'),
    StudyActions: () => import('@/components/Studies/page/StudyActions')
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
      loading: false
    }
  },
  computed: {
    study () {
      return Study.find(this.$route.params.id)
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
        await Study.fetchById(studyId)
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
        await Study.persist(payload)
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
      await this.study.toggleArchived()
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
