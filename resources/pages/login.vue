<template>
  <v-card>
    <v-card-title>
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
      <h1 class="text-center subtitle-1">
        Please sign in
      </h1>
      <v-form ref="form" v-model="valid" lazy-validation>
        <v-row>
          <v-col cols="12">
            <v-text-field
              v-model="email"
              :rules="validation.email"
              validate-on-blur
              label="Email address"
            />
          </v-col>
          <v-col cols="12">
            <v-text-field
              v-model="password"
              :rules="validation.password"
              label="password"
              type="password"
            />
          </v-col>
        </v-row>
      </v-form>
      <v-alert v-if="error" type="error">
        {{ error }}
      </v-alert>
    </v-card-text>
    <v-card-actions>
      <v-spacer />
      <v-btn to="/password" nuxt>
        Recover password
      </v-btn>
      <v-btn
        :disabled="!valid"
        :loading="authenticating"
        color="primary"
        @click="login"
      >
        Sign in
        <v-icon right>
          mdi-login
        </v-icon>
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import { emailRule } from '~/assets/js/validationrules'

export default {
  layout: 'guest',
  middleware: ['auth'],
  auth: 'guest',
  data () {
    return {
      authenticating: false,
      email: '',
      password: '',
      valid: true,
      error: '',
      validation: {
        email: [
          v => !!v || 'Please provide your email address',
          v => emailRule(v) || 'This e-mail address is invalid'
        ],
        password: [
          v => !!v || 'Please provide a password'
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
    // eslint-disable-next-line require-await
    async login () {
      if (!this.$refs.form.validate()) { return }
      this.authenticating = true
      try {
        await this.$auth.loginWith('local', {
          data: {
            email: this.email,
            password: this.password
          }
        })
      } catch (e) {
        this.error = e.response?.data?.message || e + ''
      }
      this.authenticating = false
    }
  },
  head () {
    return {
      title: 'Login'
    }
  }
}
</script>
