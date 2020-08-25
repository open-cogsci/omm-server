<template>
  <v-form ref="form" v-model="validates" lazy-validation>
    <v-container fluid>
      <v-row>
        <v-col v-if="requestOldPassword" cols="12">
          <v-text-field
            v-model="entries.old_password"
            :rules="validation.old_password"
            :label="$t('password_reset.fields.old_password.label')"
            :error-messages="errors.old_password"
            type="password"
            @input="removeErrors('old_password')"
          />
        </v-col>
        <v-col cols="12">
          <v-text-field
            v-model="entries.password"
            :rules="validation.password"
            :label="$t('password_reset.fields.password.label')"
            type="password"
          />
        </v-col>
        <v-col cols="12">
          <v-text-field
            v-model="entries.password_confirmation"
            :rules="validation.password_confirmation"
            :label="$t('password_reset.fields.password_confirmation.label')"
            type="password"
          />
        </v-col>
      </v-row>
      <v-row v-if="!hideButton">
        <v-col cols="12" class="text-right">
          <v-btn
            :disabled="!validates"
            :loading="saving"
            color="primary"
            @click="$emit('clicked-save', entries)"
            v-text="$t('password_reset.buttons.change')"
          />
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
    },
    hideButton: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      validates: true,
      entries: {},
      validation: {
        old_password: [
          v => this.requestOldPassword && (!isEmpty(v) ||
            this.$t('password_reset.fields.old_password.validation.empty'))
        ],
        password: [
          v => !isEmpty(v) || this.$t('password_reset.fields.password.validation.empty')
        ],
        password_confirmation: [
          v => !isEmpty(v) || this.$t('password_reset.fields.password_confirmation.validation.empty'),
          v => v === this.entries.password ||
            this.$t('password_reset.fields.password_confirmation.validation.mismatch')
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
