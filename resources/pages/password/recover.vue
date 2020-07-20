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
        {{ $t('password_recover.subheader') }}
      </p>
      <v-form ref="form" v-model="valid" lazy-validation @submit.stop="send">
        <v-row>
          <v-col cols="12">
            <v-text-field
              v-model="email"
              :rules="validation.email"
              :label="$t('password_recover.fields.email.label')"
              :error-messages="errors.uid"
              @input="errors.uid = null"
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
      <v-btn color="primary" :to="localePath({name: 'login'})" nuxt>
        {{ $t('password_recover.buttons.signin') }}
      </v-btn>
      <v-btn
        :disabled="!valid || (status && status.type === 'success')"
        color="success"
        @click="send"
      >
        {{ $t('password_recover.buttons.email') }}
        <v-icon right>
          mdi-send
        </v-icon>
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import { isEmpty, isEmail } from 'validator'
import { RECOVER_PASSWORD } from '@/assets/js/endpoints'
import { processErrors } from '@/assets/js/errorhandling'

export default {
  layout: 'guest',
  auth: 'guest',
  data () {
    return {
      email: '',
      valid: true,
      validation: {
        email: [
          v => !isEmpty(`${v}`) || this.$t('password_recover.fields.email.validation.empty'),
          v => isEmail(v) || this.$t('password_recover.fields.email.validation.invalid')
        ]
      },
      errors: {},
      status: null
    }
  },
  methods: {
    async send () {
      try {
        await this.$axios.post(RECOVER_PASSWORD, { uid: this.email })
        this.status = { type: 'success', message: this.$t('password_recover.messages.received') }
      } catch (e) {
        this.status = processErrors(e)
        this.status.type = 'error'
      }
    }
  }
}
</script>
