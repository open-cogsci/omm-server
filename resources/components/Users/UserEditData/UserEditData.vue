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
        <v-switch
          v-model="userData.active"
          label="Active"
        />
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
import { isEqual } from 'lodash'

const EMPTY_VALUES = {
  name: '',
  email: '',
  active: true
}

export default {
  components: {
    UnsavedChangesDialog: () => import('@/components/Common/UnsavedChangesDialog')
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
          v => !isEmail(v) || 'Invalid email address'
        ]
      }
    }
  },
  methods: {
    dataChanged () {
      const newData = JSON.parse(JSON.stringify(this.userData))
      const originalData = JSON.parse(JSON.stringify(this.user))
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
      this.$emit('clicked-cancel', this.user.id)
    },
    clear () {
      this.userData = { ...EMPTY_VALUES }
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
