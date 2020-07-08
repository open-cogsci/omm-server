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
              <v-form ref="pwForm" v-model="pwFormValid" lazy-validation>
                <v-container fluid>
                  <v-row>
                    <v-col cols="12">
                      <v-text-field
                        v-model="password.password"
                        :rules="validation.password"
                        label="Old password"
                        :error-messages="errors.password"
                        type="password"
                        @input="errors.password = ''"
                      />
                    </v-col>
                    <v-col cols="12">
                      <v-text-field
                        v-model="password.newPassword"
                        :rules="validation.newPassword"
                        label="New password"
                        validate-on-blur
                        type="password"
                      />
                    </v-col>
                    <v-col cols="12">
                      <v-text-field
                        v-model="password.newPassword2"
                        :rules="validation.newPassword2"
                        label="Repeat new password"
                        type="password"
                        validate-on-blur
                      />
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col cols="12" class="text-right">
                      <v-btn
                        :disabled="!pwFormValid"
                        :loading="savingPassword"
                        class="success"
                        @click="savePassword"
                      >
                        Change password
                      </v-btn>
                    </v-col>
                  </v-row>
                </v-container>
              </v-form>
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

export default {
  data () {
    return {
      user: { ...this.$auth.user },
      password: {
        password: '',
        newPassword: '',
        newPassword2: ''
      },
      validation: {
        name: [v => !!v || 'Name cannot be empty'],
        email: [
          v => !!v || 'Email cannot be empty',
          v => isEmail(v) || 'Invalid email address'
        ],
        password: [
          v => !!v || 'Please provide your current password'
        ],
        newPassword: [
          v => !!v || 'Please provide a new password'
        ],
        newPassword2: [
          v => !!v || 'Please repeat your new password',
          v => v === this.password.newPassword || 'Does not match with first new password'
        ]
      },
      errors: {},
      detailsFormValid: true,
      pwFormValid: true,
      savingDetails: false,
      savingPassword: false
    }
  },
  methods: {
    ...mapActions('notifications', ['notify']),
    async saveDetails () {
      if (!this.$refs.detailsForm.validate()) { return }
      const data = { ...this.user }
      this.savingDetails = true
      try {
        const response = await this.$axios.$put('/api/v1/auth/user', data)
        this.notify({
          message: response.message,
          color: 'success'
        })
        await this.$auth.fetchUser()
      } catch (e) {
        this.errors = processErrors(e, this.notify)
      }
      this.savingDetails = false
    },
    async savePassword () {
      if (!this.$refs.pwForm.validate()) { return }
      const data = { ...this.password }
      this.errors = {}
      this.savingPassword = true
      try {
        await this.$axios.$put('/api/v1/auth/user/change_password', data)
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
