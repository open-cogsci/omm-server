<template>
  <v-container>
    <v-col cols="12" xl="8" offset-xl="2">
      <v-row>
        <v-col cols="12">
          <h1 class="display-1 font-weight-light">
            {{ $t('layout.appbar.account') }}
          </h1>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12" md="6">
          <v-card>
            <v-card-title>
              <v-col cols="12">
                {{ $t('account.details.title') }}
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
                        :label="$t('account.details.name')"
                        validate-on-blur
                        @input="errors.name = ''"
                      />
                    </v-col>
                    <v-col cols="12">
                      <v-text-field
                        v-model="user.email"
                        :rules="validation.email"
                        :error-messages="errors.email"
                        :label="$t('account.details.email')"
                        validate-on-blur
                        @input="errors.email = ''"
                      >
                        <template v-if="$auth.user.account_status === 'pending'" v-slot:append>
                          <v-tooltip
                            bottom
                          >
                            <template v-slot:activator="{ on }">
                              <v-icon color="warning" v-on="on">
                                mdi-alert
                              </v-icon>
                            </template>
                            <!-- eslint-disable-next-line vue/no-v-html -->
                            <span v-html="$t('account.details.unverified_email')" />
                          </v-tooltip>
                        </template>
                      </v-text-field>
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col cols="12" class="text-right">
                      <v-btn
                        v-if="$auth.user.account_status === 'pending'"
                        :loading="resending"
                        @click="resendVerificationEmail"
                      >
                        {{ $t('account.buttons.resend_verification_mail') }}
                      </v-btn>
                      <v-btn
                        :disabled="!detailsFormValid"
                        :loading="savingDetails"
                        color="primary"
                        @click="saveDetails"
                      >
                        {{ $t('buttons.save') }}
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
                {{ $t('account.change_password') }}
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
import { UPDATE_PASSWORD, UPDATE_ACCOUNT, RESEND_VERIFICATION } from '@/assets/js/endpoints'

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
      savingPassword: false,
      resending: false
    }
  },
  computed: {
    User () {
      return this.$store.$db().model('users')
    },
    verified () {
      return 'mdi-alert'
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
        this.User.insertOrUpdate({ data: this.$auth.user })
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
    },
    async resendVerificationEmail () {
      this.resending = true
      try {
        await this.$axios.post(RESEND_VERIFICATION)
        this.notify({
          message: 'E-mail sent. Please check your inbox',
          color: 'success'
        })
      } catch (e) {
        this.errors = processErrors(e, this.notify)
      }
      this.resending = false
    }
  },
  head () {
    return {
      title: 'Account'
    }
  }
}
</script>
