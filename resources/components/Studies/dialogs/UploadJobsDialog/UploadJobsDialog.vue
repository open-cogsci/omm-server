<template>
  <base-upload-dialog
    max-width="750px"
    persistent
    title="Upload jobs"
    subtitle="Supply your jobs in a tabular format (e.g excel or csv)"
    accepted-file-types=".csv,.xls,.xlsx"
    :message="warning"
    v-bind="$props"
    v-on="$listeners"
  >
    <template v-if="progress === 100 && uploadStatus.inProgress" v-slot:status>
      <span class="primary--text">Processing...</span>
      <v-progress-linear indeterminate color="primary" />
    </template>
  </base-upload-dialog>
</template>

<script>
import isNumber from 'lodash/isNumber'

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
  },
  data: () => ({
    warning: {
      type: 'orange--text',
      content: '<strong>Warning:</strong> Replacing the jobs file will erase all collected data for this study.'
    }
  }),
  computed: {
    progress () {
      return isNumber(this.uploadStatus.progress) && this.uploadStatus.progress
    }
  }
}
</script>
