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
      <p>{{ $t('password.subheader') }}</p>
      <v-form v-model="valid" lazy-validation>
        <v-row>
          <v-col cols="12">
            <v-text-field
              v-model="email"
              :rules="validation.email"
              validate-on-blur
              :label="$t('password.fields.email.label')"
            />
          </v-col>
        </v-row>
      </v-form>
    </v-card-text>
    <v-card-actions>
      <v-spacer />
      <v-btn color="primary" :to="localePath({name: 'login'})" nuxt>
        {{ $t('password.buttons.signin') }}
      </v-btn>
      <v-btn :disabled="!valid" color="success">
        {{ $t('password.buttons.email') }}
        <v-icon right>
          mdi-send
        </v-icon>
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import { isEmpty, isEmail } from 'validator'

export default {
  layout: 'guest',
  auth: 'guest',
  data () {
    return {
      email: '',
      valid: true,
      validation: {
        email: [
          v => !isEmpty(`${v}`) || this.$t('password.fields.email.validation.empty'),
          v => isEmail(v) || this.$t('password.fields.email.validation.invalid')
        ]
      }
    }
  }
}
</script>
