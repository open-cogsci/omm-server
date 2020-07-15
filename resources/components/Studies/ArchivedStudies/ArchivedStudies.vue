<template>
  <studies-list
    :studies="studies"
    :loading="loading"
  />
</template>

<script>
import { mapActions } from 'vuex'

import Study from '@/models/Study'
import User from '@/models/User'

import { processErrors } from '@/assets/js/errorhandling'

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
        .whereHas('users', (q) => {
          q.where('id', this.$auth.user.id)
        })
        .where('active', false)
        .orderBy('created_at', 'desc')
        .get()
    }
  },
  created () {
    this.loadStudies()
  },
  methods: {
    ...mapActions('notifications', ['notify']),
    async loadStudies () {
      this.loading = true
      try {
        const response = await Study.fetch({ params: { active: false } })
        // Attach studies to local representation of logged in user.
        User.insertOrUpdate({
          where: this.$auth.user.id,
          data: {
            id: this.$auth.user.id,
            studies: response.entities.studies
          }
        })
      } catch (e) {
        processErrors(e, this.notify)
      }
      this.loading = false
    }
  }
}
</script>
