<template>
  <v-dialog
    :value="value"
    max-width="500px"
    @input="$emit('input', $event)"
  >
    <v-card>
      <v-card-title>{{ $t('study_participants.dialogs.data.title') }}</v-card-title>
      <v-card-text class="body-1 font-weight-light">
        {{ $t('study_participants.dialogs.data.subtitle') }}
      </v-card-text>
      <v-card-text>
        <v-row>
          <v-col v-for="button in buttons" :key="button.type" cols="12" sm="4">
            <v-btn
              color="primary"
              block
              class="mb-2"
              :loading="generating === button.type"
              :disabled="generating && generating !== button.type"
              @click="attemptDownload(button.type)"
            >
              <v-icon v-if="button.icon" left v-text="button.icon" />
              {{ button.type }}
            </v-btn>
            <v-btn
              v-if="button.generated"
              block
              :disabled="generating && generating !== button.type"
              @click="$emit('generate', button.type)"
            >
              {{ $t('study_participants.dialogs.data.buttons.regenerate') }}
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
      <v-expand-transition>
        <v-card-text v-show="!!message">
          <!-- eslint-disable-next-line vue/no-v-html -->
          <v-alert type="success">
            {{ message }}
          </v-alert>
        </v-card-text>
      </v-expand-transition>
      <!-- eslint-disable-next-line vue/no-v-html -->
      <v-card-text class="caption" v-html="$t('study_participants.dialogs.data.explanation')" />
      <v-card-actions>
        <v-spacer />
        <v-btn text @click="$emit('input', false)">
          {{ $t('buttons.close') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { keyBy } from 'lodash'

export default {
  props: {
    value: {
      type: Boolean,
      required: true
    },
    files: {
      type: Array,
      default: () => []
    },
    generating: {
      type: String,
      default: null
    }
  },
  data () {
    return {
      btns: [
        {
          type: 'csv',
          icon: 'mdi-file-delimited'
        },
        {
          type: 'xlsx',
          icon: 'mdi-microsoft-excel'
        },
        {
          type: 'ods',
          icon: 'mdi-google-spreadsheet'
        }
      ],
      watchType: null,
      message: null
    }
  },
  computed: {
    dataFiles () {
      return keyBy(this.files.filter(file => file.type.includes('data-')), 'type')
    },
    buttons () {
      return this.btns.map((btn) => {
        btn.generated = Object.keys(this.dataFiles).includes(`data-${btn.type}`)
        return btn
      })
    }
  },
  watch: {
    dataFiles (val) {
      if (!this.watchType) { return }
      if (Object.keys(val).includes(`data-${this.watchType}`)) {
        this.download(this.watchType)
      }
      this.watchType = null
    },
    generating (newVal, oldVal) {
      if (newVal === null && oldVal && Object.keys(this.dataFiles).includes(`data-${oldVal}`)) {
        this.showSuccessMessage(oldVal)
      }
    }
  },
  methods: {
    attemptDownload (type) {
      if (Object.keys(this.dataFiles).includes(`data-${type}`)) {
        this.download(type)
      } else {
        this.watchType = type
        this.$emit('generate', type)
      }
    },
    download (type) {
      const url = this.dataFiles[`data-${type}`].path
      window.location.assign(url)
    },
    showSuccessMessage (type) {
      this.message = `Succesfully (re)generated ${type} file. Click on the blue button to download it.`
      setTimeout(() => { this.message = null }, 5000)
    }
  }
}
</script>
