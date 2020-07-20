<template>
  <v-container>
    <v-col cols="12" xl="8" offset-xl="2">
      <v-row>
        <v-col cols="12">
          <h1 class="display-1 font-weight-light">
            Your account
          </h1>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12" md="6">
          <v-card>
            <v-card-title>
              <v-col cols="12">
                Your details
              </v-col>
            </v-card-title>
            <v-card-text>
              <v-form ref="detailsForm" v-model="detailsFormValid">
                <v-container fluid>
                  <v-row>
                    <v-col cols="12">
                      <v-text-field
                        v-model="user.name"
                        :rules="validation.name"
                        :error-messages="errors.name"
                        label="Name"
                        validate-on-blur
                        @input="errors.name = ''"
                      />
                    </v-col>
                    <v-col cols="12">
                      <v-text-field
                        v-model="user.email"
                        :rules="validation.email"
                        :error-messages="errors.email"
                        label="Email"
                        validate-on-blur
                        @input="errors.email = ''"
                      />
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col cols="12" class="text-right">
                      <v-btn
                        :disabled="!detailsFormValid"
                        :loading="savingDetails"
                        class="success"
                        @click="saveDetails"
                      >
                        Save
                      </v-btn>
                    </v-col>
                  </v-row>
                </v-container>
              </v-form>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" md="6">
          <v-card>
            <v-card-title>
              <v-col cols="12">
                Change your password
              </v-col>
            </v-card-title>
            <v-card-text>
              <reset-password-form
                ref="pwForm"
                :errors.sync="errors"
                :saving="savingPassword"
                @clicked-save="savePassword"
              />
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-col>
  </v-container>
</template>

<script>
import { mapActions } from 'vuex'
import { isEmail } from 'validator'
import { processErrors } from '@/assets/js/errorhandling'
import { UPDATE_PASSWORD, UPDATE_ACCOUNT } from '@/assets/js/endpoints'

import User from '@/models/User'

export default {
  components: {
    ResetPasswordForm: () => import('@/components/Users/ResetPasswordForm')
  },
  data () {
    return {
      user: { ...this.$auth.user },
      validation: {
        name: [v => !!v || 'Name cannot be empty'],
        email: [
          v => !!v || 'Email cannot be empty',
          v => isEmail(v) || 'Invalid email address'
        ]
      },
      errors: {},
      detailsFormValid: true,
      savingDetails: false,
      savingPassword: false
    }
  },
  methods: {
    ...mapActions('notifications', ['notify']),
    async saveDetails () {
      if (!this.$refs.detailsForm.validate()) { return }
      this.savingDetails = true
      try {
        await this.$axios.put(UPDATE_ACCOUNT, this.user)
        this.notify({
          message: 'Information change success',
          color: 'success'
        })
        await this.$auth.fetchUser()
        User.insertOrUpdate({ data: this.$auth.user })
      } catch (e) {
        this.errors = processErrors(e, this.notify)
      }
      this.savingDetails = false
    },
    async savePassword (data) {
      if (!this.$refs.pwForm.validate()) { return }
      this.errors = {}
      this.savingPassword = true
      try {
        await this.$axios.put(UPDATE_PASSWORD, data)
        this.notify({
          message: 'Password saved',
          color: 'success'
        })
        this.$refs.pwForm.reset()
      } catch (e) {
        this.errors = processErrors(e, this.notify)
      }
      this.savingPassword = false
    }
  },
  head () {
    return {
      title: 'Account'
    }
  }
}
</script>
