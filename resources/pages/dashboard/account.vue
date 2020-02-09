<template>
  <v-container fluid>
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
                      @click="saveDetails"
                      class="success"
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
                      v-model="password.old"
                      :rules="validation.password_old"
                      label="Old password"
                      type="password"
                    />
                  </v-col>
                  <v-col cols="12">
                    <v-text-field
                      v-model="password.new"
                      :rules="validation.password_new"
                      label="New password"
                      validate-on-blur
                      type="password"
                    />
                  </v-col>
                  <v-col cols="12">
                    <v-text-field
                      v-model="password.new2"
                      :rules="validation.password_new2"
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
                      @click="savePassword"
                      class="success"
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
import { emailRule } from '~/assets/js/validationrules'

export default {
  head () {
    return {
      title: 'Settings'
    }
  },
  data () {
    return {
      user: { ...this.$auth.user },
      password: {
        old: '',
        new: '',
        new2: ''
      },
      validation: {
        name: [v => !!v || 'Name cannot be empty'],
        email: [
          v => !!v || 'Email cannot be empty',
          v => emailRule(v) || 'Invalid email address'
        ],
        password_old: [
          v => !!v || 'Please provide your current password'
        ],
        password_new: [
          v => !!v || 'Please provide a new password'
        ],
        password_new2: [
          v => !!v || 'Please repeat your new password',
          v => v === this.password.new || 'Does not match with first new password'
        ]
      },
      detailsFormValid: true,
      pwFormValid: true
    }
  },
  methods: {
    async saveDetails () {
      if (!this.$refs.detailsForm.validate()) { return }
      const data = { ...this.user }
      await this.$emit('details', data)
    },
    async savePassword () {
      if (!this.$refs.pwForm.validate()) { return }
      const data = { ...this.password }
      await this.$emit('password', data)
    }
  }
}
</script>
