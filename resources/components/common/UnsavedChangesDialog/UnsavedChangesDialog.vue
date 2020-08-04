<template>
  <confirmation-dialog
    v-model="dialog"
    @clicked-yes="$emit('clicked-yes')"
    @clicked-no="$emit('clicked-no')"
  >
    <template v-slot:title>
      You have unsaved changes
    </template>
    You will lose these changes if you don't save them first.<br>
    Are you sure you want to cancel?
  </confirmation-dialog>
</template>

<script>
export default {
  components: {
    ConfirmationDialog: () => import('../ConfirmationDialog')
  },
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
