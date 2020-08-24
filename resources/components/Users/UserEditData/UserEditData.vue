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
          label="Name"
          @input="removeErrors('name')"
        />
        <v-text-field
          v-model="userData.email"
          :rules="validation.email"
          :error-messages="errors.email"
          label="Email address"
          @input="removeErrors('email')"
        />
        <v-select
          v-model="userData.user_type_id"
          label="User type"
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
              <span v-if="user.last_login">Resend verification email</span>
              <span v-else>Resend activation email</span>
            </v-btn>
          </v-col>
          <v-col v-else-if="user.id" cols="12">
            <v-switch
              v-model="userData.account_status"
              class="mt-0"
              :label="userData.account_status | upperFirst"
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
          v => !isEmpty(v) || 'Name cannot be empty',
          v => isLength(v, { max: this.maxNameLength }) ||
          `This field has a maximum of ${this.maxNameLength} characters`
        ],
        email: [
          v => !isEmpty(v) || 'email cannot be empty',
          v => isEmail(v) || 'Invalid email address'
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
        if (this.dataChanged() || !isEmpty(this.userData.password)) {
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
