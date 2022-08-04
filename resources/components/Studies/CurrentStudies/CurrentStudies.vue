<template>
  <div>
    <new-study-dialog
      ref="dialog"
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
import { processErrors } from '@/assets/js/errorhandling'

export default {
  components: {
    StudiesList: () => import('../StudiesList'),
    newStudyDialog: () => import('../dialogs/NewStudyDialog')
  },
  props: {
    filter: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      dialog: false,
      saving: false,
      loading: false,
      errors: { name: '', description: '', information: '' }
    }
  },
  computed: {
    Study () {
      return this.$store.$db().model('studies')
    },
    User () {
      return this.$store.$db().model('users')
    },
    studies () {
      return this.Study.query()
        .whereHas('users', (q) => {
          q.where('id', this.$auth.user.id)
        })
        .with('users')
        .where('active', true)
        .orderBy('created_at', 'desc')
        .get()
    }
  },
  created () {
    return this.loadStudies()
  },
  methods: {
    ...mapActions('notifications', ['notify']),
    async loadStudies () {
      this.loading = true
      try {
        await this.Study.fetch()
      } catch (e) {
        processErrors(e, this.notify)
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
        await this.Study.persist({
          name: newStudyData.name,
          description: newStudyData.description,
          information: newStudyData.information
        })
        this.notify({
          message: this.$t('studies.notifications.created'),
          color: 'success'
        })
        this.dialog = false
        this.$refs.dialog.clear()
      } catch (e) {
        this.errors = processErrors(e, this.notify)
      } finally {
        this.saving = false
      }
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
