<template>
  <v-container>
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
                      label="Name"
                      validate-on-blur
                    />
                  </v-col>
                  <v-col cols="12">
                    <v-text-field
                      v-model="user.email"
                      :rules="validation.email"
                      label="Email"
                      validate-on-blur
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
  </v-container>
</template>

<script>
import { mapActions } from 'vuex'
import { emailRule } from '~/assets/js/validationrules'

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
          v => emailRule(v) || 'Invalid email address'
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
        this.notify({
          message: `Error saving data: ${e}`,
          color: 'danger'
        })
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
        if (e.response.data.errors) {
          this.errors = { ...e.response.data.errors }
        }
        this.notify({
          message: `Error saving password: ${e.response.data.message}`,
          color: 'error'
        })
      }
      this.savingPassword = false
    }
  },
  head () {
    return {
      title: 'Settings'
    }
  }
}
</script>
