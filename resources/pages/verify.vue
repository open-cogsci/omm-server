<template>
  <v-card width="475">
    <v-card-title class="justify-center">
      <v-img
        :src="require('@/assets/img/cogsci.png')"
        max-height="40"
        max-width="40"
        class="mx-2"
        contain
      />
      <span class="display-1 font-weight-light">Open Monkey Mind</span>
    </v-card-title>
    <v-card-text>
      <p v-if="!status">
        <v-progress-linear
          indeterminate
          color="green"
        /><br>
        <span>Verifying email address.</span>
      </p>
      <v-alert v-else :type="status.type">
        {{ status.message }}
      </v-alert>
    </v-card-text>
  </v-card>
</template>

<script>
import { VERIFY_EMAIL } from '@/assets/js/endpoints'
import { processErrors } from '@/assets/js/errorhandling'

export default {
  layout: 'guest',
  middleware: ['auth'],
  auth: 'guest',
  data () {
    return {
      verifying: false,
      status: null
    }
  },
  mounted () {
    setTimeout(this.verify, 1000)
  },
  methods: {
    async verify () {
      const token = this.$route.query.token
      if (!token) {
        return
      }
      this.verifing = true
      try {
        const uri = `${VERIFY_EMAIL}/${encodeURIComponent(token)}`
        await this.$axios.post(uri)
        this.status = {
          message: 'Thank you. You email address has been verified.',
          type: 'success'
        }
      } catch (e) {
        processErrors(e, (notification) => {
          this.status = {
            message: notification.message,
            type: notification.color
          }
        })
      }
      this.verifying = false
    }
  },
  beforeRouteEnter (to, from, next) {
    // If not token is provided in the query string, redirect to login
    if (!to.query.token) {
      next(vm => vm.$router.replace(vm.localePath({ name: 'login' })))
    }
    next()
  }
}
</script>
