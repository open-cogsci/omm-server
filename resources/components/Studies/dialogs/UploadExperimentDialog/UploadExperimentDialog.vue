<template>
  <base-upload-dialog
    max-width="750px"
    persistent
    :title="$t('studies.dialogs.upload_experiment.title')"
    :subtitle="$t('studies.dialogs.upload_experiment.subtitle')"
    accepted-file-types=".osexp"
    v-bind="$props"
    v-on="$listeners"
  />
</template>

<script>
export default {
  components: {
    BaseUploadDialog: () => import('../BaseUploadDialog')
  },
  props: {
    value: {
      type: Boolean,
      default: false
    },
    uploadStatus: {
      type: Object,
      default: () => ({})
    },
    previousFile: {
      type: Object,
      default: () => ({})
    }
  }
}
</script>
