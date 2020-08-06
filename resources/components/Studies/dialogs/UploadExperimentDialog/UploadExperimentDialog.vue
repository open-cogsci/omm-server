<template>
  <v-dialog
    :value="value"
    max-width="750px"
    persistent
    @input="$emit('input', $event)"
  >
    <v-card>
      <v-card-title>
        Upload experiment file
      </v-card-title>
      <v-card-text class="body-1 font-weight-light">
        You can upload an OpenSesame osexp file using the box below. If you upload a file while one
        is already present on the server, the previous file will be overwritten.
      </v-card-text>
      <v-fade-transition absolute mode="out-in">
        <v-card-text
          v-if="previousFile.filename && !replaceFile"
          key="prevFile"
          style="min-height:126px"
        >
          <v-row align="center">
            <v-col cols="12" sm="10">
              File currently on server:<br>
              <span class="body-1 primary--text">
                <a :href="previousFile.path" target="_blank">{{ previousFile.filename }}</a>
              </span>
              <span class="caption">(uploaded at {{ previousFile.created_at }})</span>
            </v-col>
            <v-col cols="12" sm="2">
              <v-btn color="primary" @click="replaceFile = true">
                Replace
              </v-btn>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-text
          v-if="!previousFile.filename || replaceFile"
          key="uploadBox"
          class="pl-5"
        >
          <v-form>
            <v-file-input
              v-model="file"
              label="File to Upload"
              show-size
              accept=".osexp"
              truncate-length="50"
              hide-details="auto"
              outlined
              :disabled="uploadStatus.inProgress"
            />
          </v-form>
          <v-row style="height: 50px">
            <v-col v-if="progress" cols="12">
              <span v-if="progress === 100" class="success--text">
                Upload complete
              </span>
              <div v-else-if="progress >= 0 && progress < 100">
                Uploading file ({{ parseInt(progress) }}%):<br>
                <v-progress-linear :value="progress" :color="progress === 100 ? 'success': 'primary'" />
              </div>
              <div v-else-if="progress === -1" class="error--text">
                Error uploading file
              </div>
            </v-col>
          </v-row>
        </v-card-text>
      </v-fade-transition>
      <v-card-actions>
        <v-spacer />
        <v-btn
          v-if="progress === 100"
          text
          @click="$emit('input', false)"
        >
          Close
        </v-btn>
        <save-cancel-buttons
          v-else
          save-icon="mdi-upload"
          save-text="upload"
          :save-disabled="!file"
          :saving="uploadStatus.inProgress"
          @clicked-save="$emit('upload', file)"
          @clicked-cancel="$emit('input', false); $emit('clicked-cancel')"
        />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import isNumber from 'lodash/isNumber'

export default {
  sync: ['file'],
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
    uploadStatus: {
      type: Object,
      default: () => ({})
    },
    previousFile: {
      type: Object,
      default: () => ({})
    }
  },
  data () {
    return {
      replaceFile: false
    }
  },
  computed: {
    progress () {
      return isNumber(this.uploadStatus.progress) && this.uploadStatus.progress
    }
  },
  watch: {
    value (val) {
      if (val) {
        this.replaceFile = false
      }
    }
  }
}
</script>
