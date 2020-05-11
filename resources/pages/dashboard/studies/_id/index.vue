<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1 class="display-1 font-weight-light">
          Study
        </h1>
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
  async created () {
    this.loading = true
    try {
      this.study = await this.$axios.get(`${STUDIES}/${this.$route.params.id}`).data
    } catch (e) {
      if (e.response.data?.error?.message) {
        this.notify({
          message: e.response.data?.error?.message || 'Unspecified error',
          color: 'error'
        })
      }
    } finally {
      this.loading = false
    }
  },
  methods: {
    ...mapActions('notifications', ['notify'])
  },
  validate ({ params }) {
    // Must be a number
    return /^\d+$/.test(params.id)
  }
}
</script>
