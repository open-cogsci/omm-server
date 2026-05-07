<template>
  <v-dialog v-model="dialog" max-width="800" persistent>
    <v-card>
      <v-card-title>
        Edit {{ type }} data
      </v-card-title>
      <v-card-text>
        <v-textarea
          v-model="jsonText"
          :placeholder="placeholderText"
          :error-messages="error ? [error] : []"
          :loading="loading"
          rows="20"
          outlined
          auto-grow
          @input="validateJson"
          @keydown.tab="handleTab"
        />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn :disabled="loading" @click="cancel">
          Cancel
        </v-btn>
        <confirmation-dialog
          v-model="clearDialog"
          @clicked-no="clearDialog = false"
          @clicked-yes="confirmClear"
        >
          <template #activator="{ on, attrs }">
            <v-btn
              color="error"
              :disabled="loading || !hasData"
              v-bind="attrs"
              v-on="on"
            >
              Clear
            </v-btn>
          </template>
          <template #title>
            Clear {{ type }} data
          </template>
          <div>
            Are you sure you want to clear all {{ type }} data? This action cannot be undone.
          </div>
        </confirmation-dialog>
        <v-btn
          color="primary"
          :disabled="Boolean(error) || loading || jsonText.trim() === ''"
          @click="handleSave"
        >
          Save
        </v-btn>

        <confirmation-dialog
          v-model="saveDialog"
          @clicked-no="saveDialog = false"
          @clicked-yes="confirmSave"
        >
          <template #title>
            Save Changes
          </template>
          <div>
            You are about to overwrite the existing data. This action cannot be undone.
          </div>
        </confirmation-dialog>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  components: {
    ConfirmationDialog: () => import('@/components/common/ConfirmationDialog/ConfirmationDialog.vue')
  },
  props: {
    value: {
      type: Boolean,
      default: false
    },
    type: {
      type: String,
      default: 'study',
      validator: val =>
        ['study', 'session', 'participant'].includes(val)
    },
    studyId: {
      type: Number,
      default: null
    },
    participantId: {
      type: String,
      default: null
    }
  },
  data () {
    return {
      jsonText: '',
      originalJsonText: '',
      originalData: {},
      error: null,
      loading: false,
      clearDialog: false,
      saveDialog: false,
      recordExists: false
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
    },
    placeholderText () {
      return JSON.stringify({ key: 123 }, null, 2)
    },
    hasData () {
      return this.recordExists
    },
    isModified () {
      return this.recordExists && Object.keys(this.originalData).length > 0
    },
    showSaveConfirmation () {
      return this.recordExists
    }
  },
  watch: {
    async dialog (newVal) {
      if (newVal) {
        this.reset()
        await this.fetchData()
      } else {
        this.reset()
      }
    }
  },
  methods: {
    async fetchData () {
      this.loading = true
      this.error = null
      try {
        const params = {}
        if (this.studyId != null) {
          params.study_id = this.studyId
        }
        if (this.participantId != null) {
          params.participant_id = this.participantId
        }
        const response = await this.$axios.get('/sessions', { params })
        const session = response.data.data || {}
        this.originalData = session.data || {}
        if (Object.keys(this.originalData).length === 0) {
          this.recordExists = false
          this.jsonText = ''
        } else {
          this.recordExists = true
          this.jsonText = JSON.stringify(this.originalData, null, 2)
        }
        this.originalJsonText = this.jsonText
      } catch (e) {
        if (e.response && e.response.status === 404) {
          this.originalData = {}
          this.recordExists = false
          this.jsonText = ''
          this.originalJsonText = ''
        } else {
          this.error = 'Failed to load data'
        }
      } finally {
        this.loading = false
      }
    },
    validateJson () {
      if (this.jsonText.trim() === '') {
        this.error = null
        return
      }
      try {
        JSON.parse(this.jsonText)
        this.error = null
      } catch (e) {
        this.error = 'Invalid JSON'
      }
    },
    handleSave () {
      if (this.showSaveConfirmation) {
        this.saveDialog = true
      } else {
        this.confirmSave()
      }
    },
    async confirmSave () {
      this.saveDialog = false
      if (this.error) {
        return
      }
      this.loading = true
      try {
        const parsedData = this.jsonText.trim() === '' ? {} : JSON.parse(this.jsonText)
        const payload = { data: JSON.stringify(parsedData) }
        if (this.studyId != null) {
          payload.study_id = this.studyId
        }
        if (this.participantId != null) {
          payload.participant_id = this.participantId
        }
        await this.$axios.put('/sessions', payload)
        this.$emit('saved', { type: this.type, data: parsedData })
        this.dialog = false
      } catch (e) {
        this.error = 'Failed to save data'
      } finally {
        this.loading = false
      }
    },
    clearData () {
      this.clearDialog = true
    },
    async confirmClear () {
      this.clearDialog = false
      this.loading = true
      try {
        const params = {}
        if (this.studyId != null) {
          params.study_id = this.studyId
        }
        if (this.participantId != null) {
          params.participant_id = this.participantId
        }
        await this.$axios.delete('/sessions', { params })
        this.$emit('cleared', { type: this.type })
        this.dialog = false
      } catch (e) {
        this.error = 'Failed to clear data'
      } finally {
        this.loading = false
      }
    },
    cancel () {
      this.dialog = false
    },
    reset () {
      this.jsonText = ''
      this.originalJsonText = ''
      this.originalData = {}
      this.error = null
      this.loading = false
      this.clearDialog = false
      this.saveDialog = false
      this.recordExists = false
    },
    handleTab (event) {
      event.preventDefault()
      const textarea = event.target
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      this.jsonText = this.jsonText.substring(0, start) + '  ' + this.jsonText.substring(end)
      this.$nextTick(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2
      })
    }
  }
}
</script>

<style scoped>
:deep(.v-text-field__slot textarea::placeholder) {
  color: #9e9e9e !important;
  font-family: monospace;
  opacity: 1;
}
</style>
