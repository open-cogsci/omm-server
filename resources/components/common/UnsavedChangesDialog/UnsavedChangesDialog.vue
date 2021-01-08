<template>
  <confirmation-dialog
    v-model="dialog"
    @clicked-yes="$emit('clicked-yes')"
    @clicked-no="$emit('clicked-no')"
  >
    <template #title>
      {{ $t('common.dialogs.unsaved_changes.title') }}
    </template>
    <!-- eslint-disable-next-line vue/no-v-html -->
    <div v-html="$t('common.dialogs.unsaved_changes.body')" />
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
