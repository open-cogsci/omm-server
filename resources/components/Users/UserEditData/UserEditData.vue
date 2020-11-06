<template>
  <div class="fill-height d-flex flex-column">
    <unsaved-changes-dialog
      v-model="dialog"
      @clicked-yes="stopEdit"
      @clicked-no="dialog = false"
    />
    <v-card-text class="fill-height">
      <v-form ref="form" v-model="validates" @submit.prevent="save">
        <v-text-field
          v-model="userData.name"
          :rules="validation.name"
          :counter="maxNameLength"
          :error-messages="errors.name"
          :label="$t('users.fields.name.label')"
          @input="removeErrors('name')"
        />
        <v-text-field
          v-model="userData.email"
          :rules="validation.email"
          :error-messages="errors.email"
          :label="$t('users.fields.email.label')"
          @input="removeErrors('email')"
        />
        <v-select
          v-model="userData.user_type_id"
          :label="$t('users.fields.user_type.label')"
          item-text="name"
          item-value="id"
          :error-messages="errors.user_type_id"
          :items="types"
          :disabled="user.id === $auth.user.id"
        />

        <v-row no-gutters>
          <v-col v-if="isFresh(user)" cols="12">
            <v-btn
              color="primary"
              :disabled="userData.email !== user.email"
              :loading="resending"
              @click="$emit('clicked-resend-email', user)"
            >
              <v-icon left>
                mdi-email
              </v-icon>
              <span v-if="user.last_login" v-text="$t('users.buttons.resend_verification_email')" />
              <span v-else v-text="$t('users.buttons.resend_activation_email')" />
            </v-btn>
          </v-col>
          <v-col v-else-if="user.id" cols="12">
            <v-switch
              v-model="userData.account_status"
              class="mt-0"
              :label="$t(`users.status.${userData.account_status}`)"
              false-value="inactive"
              true-value="active"
              :disabled="user.id === $auth.user.id"
            />
          </v-col>
        </v-row>
      </v-form>
    </v-card-text>
    <v-card-actions>
      <v-spacer />
      <save-cancel-buttons
        :saving="saving"
        :saving-disabled="!validates"
        @clicked-save="save"
        @clicked-cancel="cancel"
      />
    </v-card-actions>
  </div>
</template>

<script>
import { isEmpty, isLength, isEmail } from 'validator'
import { upperFirst, isEqual, omit } from 'lodash'
import UserType from '@/models/UserType'
import servererrors from '@/mixins/servererrors'

const EMPTY_VALUES = {
  name: '',
  email: '',
  password: Math.random().toString(20).substr(2, 10),
  user_type_id: 2,
  account_status: 'active'
}

export default {
  components: {
    UnsavedChangesDialog: () => import('@/components/common/UnsavedChangesDialog'),
    SaveCancelButtons: () => import('@/components/common/SaveCancelButtons')
  },
  filters: {
    upperFirst (val) {
      return upperFirst(val)
    }
  },
  mixins: [servererrors],
  props: {
    user: {
      type: Object,
      default: () => ({ ...EMPTY_VALUES })
    },
    saving: {
      type: Boolean,
      default: false
    },
    resending: {
      type: Boolean,
      default: false
    },
    errors: {
      type: Object,
      default: () => ({})
    }
  },
  data () {
    return {
      dialog: false,
      validates: true,
      userData: { ...this.user },
      maxNameLength: 50,
      validation: {
        name: [
          v => !isEmpty(v) || this.$t('users.fields.name.errors.notEmpty'),
          v => isLength(v, { max: this.maxNameLength }) ||
            this.$t('users.fields.name.errors.maxLength') + ` ${this.maxNameLength}`
        ],
        email: [
          v => !isEmpty(v) || this.$t('users.fields.email.errors.notEmpty'),
          v => isEmail(v) || this.$t('users.fields.email.errors.invalid')
        ]
      }
    }
  },
  computed: {
    types () {
      return UserType.all()
    }
  },
  methods: {
    isFresh (user) {
      return user.account_status === 'pending'
    },
    dataChanged () {
      const newData = JSON.parse(JSON.stringify(omit(this.userData, 'password')))
      const originalData = JSON.parse(JSON.stringify(omit(this.user, 'password')))
      return !isEqual(originalData, newData)
    },
    save () {
      if (this.$refs.form.validate()) {
        if (this.dataChanged()) {
          this.$emit('clicked-save', this.userData)
        } else {
          this.stopEdit()
        }
      }
    },
    cancel () {
      if (this.dataChanged()) {
        this.dialog = true
      } else {
        this.stopEdit()
      }
    },
    stopEdit () {
      this.clear()
      this.$emit('clicked-cancel', this.user.id)
    },
    clear () {
      this.userData = { ...EMPTY_VALUES }
      this.userData.password = Math.random().toString(20).substr(2, 10)
      this.resetValidation()
    },
    resetValidation () {
      this.$refs.form.resetValidation()
    }
  }
}
</script>
