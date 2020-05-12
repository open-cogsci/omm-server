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
          <div>
            <p class="display-1 font-weight-light" v-text="study.name" />
            <h2
              v-if="study.description"
              class="title font-weight-light grey--text"
              v-text="study.description"
            />
          </div>
        </v-skeleton-loader>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapActions } from 'vuex'
import { STUDIES } from '@/assets/js/endpoints'

export default {
  data () {
    return {
      loading: false,
      study: {}
    }
  },
  mounted () {
    this.fetch(this.$route.params.id)
  },
  methods: {
    ...mapActions('notifications', ['notify']),
    async fetch (studyId) {
      this.loading = true
      try {
        this.study = (await this.$axios.get(`${STUDIES}/${studyId}`)).data.data
      } catch (e) {
        this.notify({
          message: e.response.data?.message || 'Unspecified error',
          color: 'error'
        })
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
      this.fetch(to.params.id)
    }
    next()
  },
  head () {
    return {
      title: 'Studies'
    }
  }
}
</script>
