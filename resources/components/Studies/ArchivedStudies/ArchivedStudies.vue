<template>
  <studies-list
    :studies="studies"
    :loading="loading"
  />
</template>

<script>
import { mapActions } from 'vuex'
import { STUDIES } from '@/assets/js/endpoints'

export default {
  components: {
    StudiesList: () => import('../StudiesList')
  },
  data () {
    return {
      loading: false,
      studies: []
    }
  },
  created () {
    this.fetch()
  },
  methods: {
    ...mapActions('notifications', ['notify']),
    async fetch () {
      this.loading = true
      try {
        const response = await this.$axios.get(STUDIES, { params: { active: false } })
        this.studies = response.data.data
      } catch (e) {
        const msg = e?.response?.data?.error?.message || e?.response?.data
        this.notify({
          message: msg || 'Unspecified error',
          color: 'error'
        })
      }
      this.loading = false
    }
  }
}
</script>
