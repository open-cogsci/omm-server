<template>
  <studies-list
    :studies="studies"
    :loading="loading"
  />
</template>

<script>
import { mapActions } from 'vuex'
import Study from '@/models/Study'

export default {
  components: {
    StudiesList: () => import('../StudiesList')
  },
  data () {
    return {
      loading: false
    }
  },
  computed: {
    studies () {
      return Study.query()
        .where('active', false)
        .orderBy('created_at', 'desc')
        .get()
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
        await Study.fetch({ params: { active: false } })
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
