<template>
  <fragment>
    <v-btn
      text
      :disabled="cancelDisabled"
      @click="$emit('clicked-cancel')"
    >
      <v-icon left>
        mdi-cancel
      </v-icon> Cancel
    </v-btn>
    <v-btn
      v-if="!saveHidden"
      text
      color="success"
      :disabled="saveDisabled"
      :loading="saving"
      @click="$emit('clicked-save')"
    >
      <v-icon left v-text="saveIcon" />
      {{ saveText }}
    </v-btn>
  </fragment>
</template>

<script>
export default {
  props: {
    saving: {
      type: Boolean,
      default: false
    },
    saveDisabled: {
      type: Boolean,
      default: false
    },
    saveHidden: {
      type: Boolean,
      default: false
    },
    saveText: {
      type: String,
      default: 'Save'
    },
    saveIcon: {
      type: String,
      default: 'mdi-check'
    },
    cancelDisabled: {
      type: Boolean,
      default: false
    }
  }
}
</script>
