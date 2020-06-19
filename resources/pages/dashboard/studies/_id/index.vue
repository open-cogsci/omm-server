<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-skeleton-loader
          :loading="loading"
          type="heading"
          transition="fade-transition"
          height="294"
        >
          <div v-if="study">
            <p class="display-1 font-weight-light" v-text="study.name" />
            <h2
              v-if="study.description"
              class="title font-weight-light grey--text"
              v-text="study.description"
            />
          </div>
          <div v-else>
            <p class="display-1 font-weight-light red--text">
              Study could not be found.
            </p>
          </div>
        </v-skeleton-loader>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapActions } from 'vuex'
import Study from '@/models/Study'
import { processErrors } from '@/assets/js/errorhandling'

export default {
  name: 'Study',
  data () {
    return {
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
