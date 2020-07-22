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
      <p class="text-center">
        {{ $t('password_reset.subheader') }}
      </p>
      <reset-password-form
        ref="pwForm"
        :request-old-password="false"
        :saving="savingPassword"
        :validates.sync="pwFormValid"
        :errors.sync="errors"
        :hide-button="passwordHasBeenReset"
        @clicked-save="savePassword"
      />
      <v-alert v-if="status" :type="status.type">
        {{ status.message }}
      </v-alert>
    </v-card-text>
    <v-card-actions v-if="passwordHasBeenReset">
      <v-spacer />
      <v-btn
        color="primary"
        @click="$router.replace(localePath('login'))"
      >
        Proceed to login
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import { RESET_PASSWORD } from '@/assets/js/endpoints'
import { processErrors } from '@/assets/js/errorhandling'

export default {
  layout: 'guest',
  middleware: ['auth'],
  auth: 'guest',
  components: {
    ResetPasswordForm: () => import('@/components/Users/ResetPasswordForm')
  },
  data () {
    return {
      errors: {},
      pwFormValid: true,
      savingPassword: false,
      status: null,
      passwordHasBeenReset: false
    }
  },
  methods: {
    async savePassword (data) {
      if (!this.$refs.pwForm.validate()) { return }
      this.errors = {}
      this.savingPassword = true

      const token = this.$route.query.token
      let cfg = null
      if (this.$route.query.etoken) {
        cfg = { params: { etoken: this.$route.query.etoken } }
      }

      try {
        const uri = `${RESET_PASSWORD}/${encodeURIComponent(token)}`
        await this.$axios.post(uri, data, cfg)
        this.status = {
          message: 'Your password has been reset.',
          type: 'success'
        }
        this.$refs.pwForm.reset()
        this.passwordHasBeenReset = true
      } catch (e) {
        processErrors(e, (notification) => {
          this.status = {
            message: notification.message,
            type: notification.color
          }
        })
      }
      this.savingPassword = false
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
