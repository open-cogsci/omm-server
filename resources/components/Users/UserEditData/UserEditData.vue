<template>
  <fragment>
    <unsaved-changes-dialog
      v-model="dialog"
      @clicked-yes="stopEdit"
      @clicked-no="dialog = false"
    />
    <v-card-text>
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
          <v-col cols="12" sm="4" md="12" lg="4">
            <v-switch
              v-model="userData.account_status"
              class="mt-0"
              :label="userData.account_status | upperFirst"
              false-value="inactive"
              true-value="active"
              :disabled="user.id === $auth.user.id || user.account_status === 'pending'"
            />
          </v-col>
          <v-col v-if="user.account_status === 'pending'" cols="12" sm="8" md="12" lg="8">
            <v-btn
              color="primary"
              :disabled="userData.email !== user.email"
              @click="$emit('clicked-resend-email', user.id)"
            >
              <v-icon left>
                mdi-email
              </v-icon> Resend account email
            </v-btn>
          </v-col>
        </v-row>
      </v-form>
    </v-card-text>
    <v-card-actions>
      <v-spacer />
      <v-btn text @click="cancel">
        <v-icon left>
          mdi-cancel
        </v-icon> Cancel
      </v-btn>
      <v-btn
        text
        color="success"
        :disabled="!validates"
        :loading="saving"
        @click="save"
      >
        <v-icon left>
          mdi-check
        </v-icon> Save
      </v-btn>
    </v-card-actions>
  </fragment>
</template>

<script>
import { isEmpty, isLength, isEmail } from 'validator'
import { upperFirst, isEqual, omit } from 'lodash'
import UserType from '@/models/UserType'

const EMPTY_VALUES = {
  name: '',
  email: '',
  password: Math.random().toString(20).substr(2, 10),
  user_type_id: 2,
  account_status: 'active'
}

export default {
  components: {
    UnsavedChangesDialog: () => import('@/components/Common/UnsavedChangesDialog')
  },
  filters: {
    upperFirst (val) {
      return upperFirst(val)
    }
  },
  props: {
    user: {
      type: Object,
      default: () => ({ ...EMPTY_VALUES })
    },
    saving: {
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
