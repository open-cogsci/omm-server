<template>
  <fragment>
    <v-card-text>
      <v-form ref="form" v-model="validates" @submit.prevent="save">
        <v-text-field
          v-model="ptcp.name"
          :rules="validation.name"
          label="Name"
        />
        <v-text-field
          v-model="ptcp.rfid"
          :rules="validation.rfid"
          label="RFID"
        />
        <v-switch
          v-model="ptcp.active"
          label="Active"
        />
      </v-form>
    </v-card-text>
    <v-card-actions>
      <v-spacer />
      <v-btn text @click="$emit('clicked-cancel', participant.id)">
        <v-icon left>
          mdi-cancel
        </v-icon> Cancel
      </v-btn>
      <v-btn
        text
        color="success"
        :disabled="!validates"
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
import { isEmpty } from 'validator'

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
    }
  },
  data () {
    return {
      validates: true,
      ptcp: { ...this.participant },
      validation: {
        name: [
          v => !isEmpty(v) || 'Name cannot be empty'
        ],
        rfid: [
          v => !isEmpty(v) || 'RFID cannot be empty'
        ]
      }
    }
  },
  methods: {
    save () {
      if (this.$refs.form.validate()) {
        this.$emit('clicked-save', this.ptcp)
      }
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
