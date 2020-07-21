<template>
  <v-card>
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
        {{ $t('login.signin') }}
      </p>
      <v-form ref="form" v-model="valid" lazy-validation>
        <v-row>
          <v-col cols="12">
            <v-text-field
              v-model="email"
              :rules="validation.email"
              :error-messages="errors.uid"
              validate-on-blur
              :label="$t('login.fields.email.label')"
              @input="removeErrors('uid')"
            />
          </v-col>
          <v-col cols="12">
            <v-text-field
              v-model="password"
              type="password"
              :rules="validation.password"
              :error-messages="errors.password"
              :label="$t('login.fields.password.label')"
              @input="removeErrors('password')"
            />
          </v-col>
        </v-row>
      </v-form>
      <v-alert v-if="status" :type="status.type">
        {{ status.message }}
      </v-alert>
    </v-card-text>
    <v-card-actions>
      <v-spacer />
      <v-btn :to="localePath({name : 'password-recover'})" nuxt v-text="$t('login.buttons.recover')" />
      <v-btn
        :disabled="!valid"
        :loading="authenticating"
        color="primary"
        @click="login"
      >
        {{ $t('login.buttons.signin') }}
        <v-icon right>
          mdi-login
        </v-icon>
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import { isEmpty, isEmail } from 'validator'
import { processErrors } from '@/assets/js/errorhandling'

export default {
  layout: 'guest',
  middleware: ['auth'],
  auth: 'guest',
  data () {
    return {
      authenticating: false,
      status: null,
      email: '',
      password: '',
      valid: true,
      errors: {},
      validation: {
        email: [
          v => !isEmpty(v) || this.$t('login.fields.email.validation.empty'),
          v => isEmail(v) || this.$t('login.fields.email.validation.invalid')
        ],
        password: [
          v => !isEmpty(v) || this.$t('login.fields.password.validation.empty')
        ]
      }
    }
  },
  computed: {
    redirect () {
      return (
        this.$route.query.redirect &&
        decodeURIComponent(this.$route.query.redirect)
      )
    },
    isCallback () {
      return Boolean(this.$route.query.callback)
    }
  },
  methods: {
    async login () {
      if (!this.$refs.form.validate()) { return }
      this.authenticating = true
      try {
        await this.$auth.loginWith('local', {
          data: {
            uid: this.email,
            password: this.password
          }
        })
      } catch (e) {
        this.errors = processErrors(e, (notification) => {
          this.status = {
            message: notification.message,
            type: notification.color
          }
        })
      }
      this.authenticating = false
    },
    removeErrors (field) {
      this.errors = {
        ...this.errors,
        [field]: ''
      }
    }
  },
  head () {
    return {
      title: 'Login'
    }
  }
}
</script>
