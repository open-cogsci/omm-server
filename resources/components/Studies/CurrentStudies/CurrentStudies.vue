<template>
  <div>
    <new-study-dialog
      v-model="dialog"
      :saving="saving"
      :errors.sync="errors"
      @clicked-save="saveNewStudy"
      @input="clearErrors"
    />
    <studies-list
      :studies="studies"
      :loading="loading"
      :add-study-button="true"
      @clicked-new-study="dialog = true"
    />
  </div>
</template>

<script>
import { mapActions } from 'vuex'
import { isArray } from 'lodash'
import { STUDIES } from '@/assets/js/endpoints'

export default {
  components: {
    StudiesList: () => import('../StudiesList'),
    newStudyDialog: () => import('../NewStudyDialog')
  },
  data () {
    return {
      studies: [],
      dialog: false,
      saving: false,
      loading: false,
      errors: {}
    }
  },
  created () {
    this.fetch()
  },
  methods: {
    ...mapActions('notifications', ['notify']),
    async fetch () {
      this.loading = true
      try {
        const response = await this.$axios.get(STUDIES)
        this.studies = response.data.data
      } catch (e) {
        const msg = e?.response?.data?.error?.message || e?.response?.data
        this.notify({
          message: msg || 'Unspecified error',
          color: 'error'
        })
      } finally {
        this.loading = false
      }
    },
    /**
     *  Save a study
     */
    async saveNewStudy (newStudyData) {
      this.saving = true
      try {
        const response = await this.$axios.post(STUDIES, {
          name: newStudyData.name,
          description: newStudyData.description
        })
        const study = response.data.data
        this.studies.unshift(study)
        this.notify({ message: 'Study has been added', color: 'success' })
        this.dialog = false
      } catch (e) {
        this.processError(e)
      } finally {
        this.saving = false
      }
    },
    /**
     * Process errors returned by axios
     *
     * @param {object} e the error provided by axios
     *
     * @returns {void}
     * */
    processError (e) {
      if (isArray(e?.response?.data)) {
        const validationErrors = e.response.data
        for (const err of validationErrors) {
          this.errors[err.field] = err.validation
        }
        this.notify({
          message: 'There were some problems with your input. Please review the form.',
          color: 'error'
        })
        return
      }

      this.notify({
        message: e?.response?.data?.error?.message || e.response?.data || e,
        color: 'error'
      })
    },
    /**
     *  Clear possible validation errors sent by adonis after closing the dialog.
     */
    clearErrors (val) {
      if (!val) {
        this.errors = { name: '', description: '' }
      }
    }
  }
}
</script>
