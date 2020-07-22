<template>
  <v-dialog v-model="dialog" persistent max-width="500">
    <v-card>
      <v-card-title>You have unsaved changes</v-card-title>
      <v-card-text>
        You will lose these changes if you don't save them first.<br>
        Are you sure you want to cancel?
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn text @click="$emit('clicked-no')">
          No, take me back
        </v-btn>
        <v-btn text color="primary" @click="$emit('clicked-yes')">
          Yes, I am sure
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  props: {
    value: {
      type: Boolean,
      required: true
    }
  },
  computed: {
    dialog: {
      get () {
        return this.value
      },
      set (val) {
        this.$emit('input', val)
      }
    }
  }

}
</script>
