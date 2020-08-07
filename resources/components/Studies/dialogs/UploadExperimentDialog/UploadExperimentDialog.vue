<template>
  <base-upload-dialog
    max-width="750px"
    persistent
    title="Upload experiment file"
    subtitle="You can upload an OpenSesame osexp file using the box below. If you upload a file while one
        is already present on the server, the previous file will be overwritten."
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
