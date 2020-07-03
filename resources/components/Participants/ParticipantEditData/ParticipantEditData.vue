<template>
  <fragment>
    <v-dialog v-model="dialog" persistent max-width="500">
      <v-card>
        <v-card-title>You have unsaved changes</v-card-title>
        <v-card-text>
          You will lose these changes if you don't save them first.<br>
          Are you sure you want to cancel?
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="dialog = false">
            No, take me back
          </v-btn>
          <v-btn color="primary" @click="stopEdit">
            Yes, I am sure
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-card-text>
      <v-form ref="form" v-model="validates" @submit.prevent="save">
        <v-text-field
          v-model="ptcp.name"
          :rules="validation.name"
          :counter="maxNameLength"
          :error-messages="errors.name"
          label="Name"
          @input="removeErrors('name')"
        />
        <v-text-field
          v-model="ptcp.rfid"
          :rules="validation.rfid"
          :error-messages="errors.rfid"
          label="RFID"
          @input="removeErrors('rfid')"
        />
        <v-switch
          v-model="ptcp.active"
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
        :saving="saving"
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
import { isEmpty, isLength } from 'validator'
import { isEqual } from 'lodash'

const EMPTY_VALUES = {
  name: '',
  rfid: '',
  active: true
}

export default {
  props: {
    participant: {
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
      ptcp: { ...this.participant },
      maxNameLength: 50,
      validation: {
        name: [
          v => !isEmpty(v) || 'Name cannot be empty',
          v => isLength(v, { max: this.maxNameLength }) ||
          `This field has a maximum of ${this.maxNameLength} characters`
        ],
        rfid: [
          v => !isEmpty(v) || 'RFID cannot be empty'
        ]
      }
    }
  },
  methods: {
    dataChanged () {
      const newData = JSON.parse(JSON.stringify(this.ptcp))
      const originalData = JSON.parse(JSON.stringify(this.participant))
      return !isEqual(originalData, newData)
    },
    save () {
      if (this.$refs.form.validate()) {
        if (this.dataChanged()) {
          this.$emit('clicked-save', this.ptcp)
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
      this.$emit('clicked-cancel', this.participant.id)
    },
    clear () {
      this.ptcp = { ...EMPTY_VALUES }
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
