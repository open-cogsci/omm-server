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
        @clicked-save="savePassword"
      />
      <v-alert v-if="status" :type="status.type">
        {{ status.message }}
      </v-alert>
    </v-card-text>
  </v-card>
</template>

<script>
import { RESET_PASSWORD } from '../../assets/js/endpoints'

export default {
  layout: 'guest',
  auth: 'guest',
  components: {
    ResetPasswordForm: () => import('@/components/Users/ResetPasswordForm')
  },
  data () {
    return {
      errors: {},
      pwFormValid: true,
      savingPassword: false,
      status: null
    }
  },
  methods: {
    async savePassword (data) {
      if (!this.$refs.pwForm.validate()) { return }
      const token = this.$route.query.token
      this.errors = {}
      this.savingPassword = true
      try {
        const uri = `${RESET_PASSWORD}/${encodeURIComponent(token)}`
        await this.$axios.post(uri, data)
        this.status = {
          message: 'Password reset. Please wait to be redirected.',
          type: 'success'
        }
        this.$refs.pwForm.reset()
        setTimeout(() => { this.$router.replace(this.localePath('login')) }, 5000)
      } catch (e) {
        this.status = {
          message: e?.response?.data?.error?.message || 'Unknown error',
          type: 'error'
        }
      }
      this.savingPassword = false
    }

  }
}
</script>
