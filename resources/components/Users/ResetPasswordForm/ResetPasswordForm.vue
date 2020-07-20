<template>
  <v-form ref="form" v-model="validates" lazy-validation>
    <v-container fluid>
      <v-row>
        <v-col v-if="requestOldPassword" cols="12">
          <v-text-field
            v-model="entries.old_password"
            :rules="validation.old_password"
            label="Old password"
            :error-messages="errors.old_password"
            type="password"
            @input="removeErrors('old_password')"
          />
        </v-col>
        <v-col cols="12">
          <v-text-field
            v-model="entries.password"
            :rules="validation.password"
            label="New password"
            type="password"
          />
        </v-col>
        <v-col cols="12">
          <v-text-field
            v-model="entries.password_confirmation"
            :rules="validation.password_confirmation"
            label="Repeat new password"
            type="password"
          />
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12" class="text-right">
          <v-btn
            :disabled="!validates"
            :loading="saving"
            class="success"
            @click="$emit('clicked-save', entries)"
          >
            Change password
          </v-btn>
        </v-col>
      </v-row>
    </v-container>
  </v-form>
</template>

<script>
import { isEmpty } from 'validator'

export default {
  props: {
    errors: {
      type: Object,
      default: () => ({})
    },
    saving: {
      type: Boolean,
      default: false
    },
    requestOldPassword: {
      type: Boolean,
      default: true
    }
  },
  data () {
    return {
      validates: true,
      entries: {},
      validation: {
        old_password: [
          v => this.requestOldPassword && (!isEmpty(v) || 'Please provide your current password')
        ],
        password: [
          v => !isEmpty(v) || 'Please provide a new password'
        ],
        password_confirmation: [
          v => !isEmpty(v) || 'Please repeat your new password',
          v => v === this.entries.password || 'Does not match with first new password'
        ]
      }
    }
  },
  created () {
    this.resetFields()
  },
  methods: {
    validate () {
      return this.$refs.form.validate()
    },
    resetFields () {
      this.entries = {
        old_password: '',
        password: '',
        password_confirmation: ''
      }
    },
    reset () {
      this.resetFields()
      return this.$refs.form.resetValidation()
    },
    removeErrors (field) {
      const errors = {
        ...this.errors,
        [field]: ''
      }
      this.$emit('update:errors', errors)
    }
  }
}
</script>
