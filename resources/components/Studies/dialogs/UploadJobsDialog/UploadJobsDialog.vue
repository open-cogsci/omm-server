<template>
  <v-dialog
    :value="value"
    max-width="750px"
    @input="$emit('input', $event)"
  >
    <v-card>
      <v-card-title>
        Upload jobs
      </v-card-title>
      <v-card-text class="body-1 font-weight-light">
        Supply your jobs using a csv or excel file below.
      </v-card-text>
      <v-card-text>
        Upload here
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <save-cancel-buttons
          :saving="saving"
          :save-disabled="!formValid"
          @clicked-save="save"
          @clicked-cancel="cancel"
        />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  components: {
    SaveCancelButtons: () => import('@/components/common/SaveCancelButtons')
  },
  props: {
    value: {
      type: Boolean,
      default: false
    },
    formValid: {
      type: Boolean,
      default: true
    },
    saving: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    cancel () {
      this.$emit('input', false)
    },
    save () {

    }
  }
}
</script>
