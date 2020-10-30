<template>
  <studies-list
    :studies="studies"
    :loading="loading"
  />
</template>

<script>
import { mapActions } from 'vuex'

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
    Study () {
      return this.$store.$db().model('studies')
    },
    User () {
      return this.$store.$db().model('users')
    },
    studies () {
      return this.Study.query()
        .whereHas('users', (q) => {
          q.where('id', this.$auth.user.id)
        })
        .with('users')
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
        const response = await this.Study.fetch({ params: { active: false } })
        // Attach studies to local representation of logged in user.
        this.User.insertOrUpdate({
          where: this.$auth.user.id,
          data: {
            id: this.$auth.user.id,
            studies: response.entities.studies
          }
        })
      } catch (e) {
        processErrors(e, this.notify)
      } finally {
        this.loading = false
      }
    }
  }
}
</script>
