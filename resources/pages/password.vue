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
      <p>Send a password reset link to the provided e-mail address.</p>
      <v-form v-model="valid" lazy-validation>
        <v-row>
          <v-col cols="12">
            <v-text-field
              :rules="validation.email"
              validate-on-blur
              label="Email address"
            />
          </v-col>
        </v-row>
      </v-form>
    </v-card-text>
    <v-card-actions>
      <v-spacer />
      <v-btn color="primary" to="/login" nuxt>
        Sign in
      </v-btn>
      <v-btn :disabled="!valid" color="success">
        Send e-mail
        <v-icon right>
          mdi-send
        </v-icon>
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import { emailRule } from '~/assets/js/validationrules'

export default {
  layout: 'guest',
  auth: 'guest',
  data () {
    return {
      email: '',
      password: '',
      valid: true,
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
  }
}
</script>
