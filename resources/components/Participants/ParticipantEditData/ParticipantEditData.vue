<template>
  <div class="fill-height d-flex flex-column">
    <unsaved-changes-dialog
      v-model="dialog"
      @clicked-yes="stopEdit"
      @clicked-no="dialog = false"
    />
    <v-card-text class="fill-height">
      <v-form ref="form" v-model="validates" lazy-validation @submit.prevent="save">
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

        <v-text-field
          v-model="ptcp.alternate_identifier"
          :rules="validation.alternate_identifier"
          :error-messages="errors.alternate_identifier"
          :label="$t('participants.fields.alternate_identifier.label')"
          @input="removeErrors('alternate_identifier')"
        />

        <v-textarea
          :value="metaToYaml"
          no-resize
          rows="3"
          label="Extra information"
          :error-messages="errors.meta"
          @input="checkYaml"
          @change="metaToJson"
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
import { isEqual, debounce } from 'lodash'
import yaml from 'js-yaml'
import servererrors from '@/mixins/servererrors'

const EMPTY_VALUES = {
  name: '',
  identifier: '',
  alternate_identifier: '',
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
          v => !isEmpty(v) || this.$t('participants.fields.identifier.errors.notEmpty'),
          v => v !== this.ptcp.alternate_identifier || this.$t('participants.fields.identifier.errors.sameAsAlt')
        ],
        alternate_identifier: [
          v => v !== this.ptcp.identifier || this.$t('participants.fields.alternate_identifier.errors.sameAsPrimary')
        ]
      }
    }
  },
  computed: {
    metaToYaml () {
      let val = this.ptcp.meta
      if (!val) { return '' }
      try {
        val = JSON.parse(val)
      } catch {}
      return yaml.safeDump(val)
    }
  },
  created () {
    this.checkYaml = debounce(this.checkYaml, 500)
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
    checkYaml (val) {
      try {
        const result = yaml.safeLoad(val, { json: true })
        this.removeErrors('meta')
        return result
      } catch (e) {
        const errors = {
          ...this.errors,
          meta: 'Invalid yaml format'
        }
        this.$emit('update:errors', errors)
        return null
      }
    },
    metaToJson (val) {
      const data = this.checkYaml(val)
      if (data === null) { return }
      this.ptcp.meta = data
    }
  }
}
</script>
