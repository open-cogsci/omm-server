<template>
  <v-dialog
    :value="value"
    max-width="750px"
    persistent
    @input="$emit('input', $event)"
  >
    <v-card>
      <v-card-title v-text="title" />
      <v-card-text class="body-1 font-weight-light" v-text="subtitle" />
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
              <!-- eslint-disable-next-line vue/no-v-html -->
              <div v-if="message" class="pt-5" :class="message.type" v-html="message.content" />
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
              :accept="acceptedFileTypes"
              truncate-length="50"
              hide-details="auto"
              outlined
              :disabled="uploadStatus.inProgress"
            />
          </v-form>
          <v-row style="height: 50px">
            <v-col cols="12">
              <slot name="status">
                <div v-if="progress">
                  <v-alert v-if="progress === 100" type="success">
                    Upload complete
                  </v-alert>
                  <div v-else-if="progress >= 0 && progress < 100">
                    Uploading file ({{ parseInt(progress) }}%):<br>
                    <v-progress-linear :value="progress" :color="progress === 100 ? 'success': 'primary'" />
                  </div>
                  <v-alert v-else-if="progress === -1" type="error">
                    Error uploading file
                  </v-alert>
                </div>
              </slot>
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
  components: {
    SaveCancelButtons: () => import('@/components/common/SaveCancelButtons')
  },
  props: {
    title: {
      type: String,
      default: 'Upload'
    },
    subtitle: {
      type: String,
      default: 'Upload your file'
    },
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
    },
    acceptedFileTypes: {
      type: String,
      default: null
    },
    message: {
      type: Object,
      default: null
    }
  },
  data () {
    return {
      file: null,
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
        this.file = null
        this.replaceFile = false
      }
    }
  }
}
</script>
