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
          v-model="ptcp.name"
          :rules="validation.name"
          :counter="maxNameLength"
          :error-messages="errors.name"
          label="Name"
          @input="removeErrors('name')"
        />
        <v-text-field
          v-model="ptcp.identifier"
          :rules="validation.identifier"
          :error-messages="errors.identifier"
          label="Identifier"
          @input="removeErrors('identifier')"
        />
        <v-switch
          v-model="ptcp.active"
          label="Active"
        />
      </v-form>
    </v-card-text>
    <v-card-actions>
      <v-spacer />
      <save-cancel-buttons
        :saving="saving"
        :save-disabled="!validates"
        @clicked-save="save"
        @clicked-cancel="cancel"
      />
    </v-card-actions>
  </fragment>
</template>

<script>
import { isEmpty, isLength } from 'validator'
import { isEqual } from 'lodash'
import servererrors from '@/mixins/servererrors'

const EMPTY_VALUES = {
  name: '',
  identifier: '',
  active: true
}

export default {
  components: {
    UnsavedChangesDialog: () => import('@/components/common/UnsavedChangesDialog'),
    SaveCancelButtons: () => import('@/components/common/SaveCancelButtons')
  },
  mixins: [servererrors],
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
        identifier: [
          v => !isEmpty(v) || 'identifier cannot be empty'
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
    }
  }
}
</script>
