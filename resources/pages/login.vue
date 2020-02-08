<template>
  <v-card>
    <v-card-title class="justify-center">
      Please Login
    </v-card-title>
    <v-card-text>
      <v-form ref="form" v-model="valid" lazy-validation>
        <v-row>
          <v-col cols="12">
            <v-text-field
              :rules="validation.email"
              v-model="email"
              validate-on-blur
              label="Email address"
            />
          </v-col>
          <v-col cols="12">
            <v-text-field
              :rules="validation.password"
              v-model="password"
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
        @click="login"
        color="primary"
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
import { validateEmail } from '~/assets/js/validationrules'

export default {
  layout: 'guest',
  middleware: ['auth'],
  auth: 'guest',
  data () {
    return {
      email: '',
      password: '',
      valid: true,
      error: '',
      validation: {
        email: [
          v => !!v || 'Please provide your email address',
          v => validateEmail(v) || 'This e-mail address is invalid'
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
      try {
        await this.$auth.loginWith('local', {
          data: {
            email: this.email,
            password: this.password
          }
        })
      } catch (e) {
        this.error = e + ''
      }
    }
  }
}
</script>
