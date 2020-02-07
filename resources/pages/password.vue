<template>
  <v-card>
    <v-card-title class="justify-center">
      Reset password
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
import { validateEmail } from '~/assets/js/validationrules'

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
          v => validateEmail(v) || 'This e-mail address is invalid'
        ],
        password: [
          v => !!v || 'Please provide a password'
        ]
      }
    }
  }
}
</script>
