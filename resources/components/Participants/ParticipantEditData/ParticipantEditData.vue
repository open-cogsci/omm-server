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
          v-model="ptcp.name"
          :rules="validation.name"
          :counter="maxNameLength"
          :error-messages="errors.name"
          :label="$t('participants.fields.name.label')"
          @input="removeErrors('name')"
        />
        <v-text-field
          v-model="ptcp.identifier"
          :rules="validation.identifier"
          :error-messages="errors.identifier"
          :label="$t('participants.fields.identifier.label')"
          @input="removeErrors('identifier')"
        />
        <v-textarea
          :value="metaToYaml"
          no-resize
          rows="3"
          label="Extra information"
          :error-messages="errors.meta"
          @input="metaToJson"
        />
        <v-switch
          v-model="ptcp.active"
          hide-details
          :label="ptcp.active ? $t('participants.active') : $t('participants.inactive')"
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
  </div>
</template>

<script>
import { isEmpty, isLength } from 'validator'
import { isEqual } from 'lodash'
import servererrors from '@/mixins/servererrors'

const EMPTY_VALUES = {
  name: '',
  identifier: '',
  meta: '',
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
          v => !isEmpty(v) || this.$t('participants.fields.name.errors.notEmpty'),
          v => isLength(v, { max: this.maxNameLength }) ||
            this.$t('participants.fields.name.errors.maxLength') + this.maxNameLength
        ],
        identifier: [
          v => !isEmpty(v) || this.$t('participants.fields.identifier.errors.notEmpty')
        ]
      }
    }
  },
  computed: {
    metaToYaml () {
      return this.ptcp.meta
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
    metaToJson (val) {
      this.removeErrors('meta')
      this.ptcp.meta = val
    }
  }
}
</script>
