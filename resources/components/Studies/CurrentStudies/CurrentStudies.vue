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
      :studies="filteredStudies"
      :filter="filter"
      :loading="loading"
      :add-study-button="true"
      :active="true"
      @clicked-new-study="dialog = true"
      @update:order="updateStudyOrder"
    />
  </div>
</template>

<script>
import { mapActions } from 'vuex'
import Fuse from 'fuse.js'
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
    filteredStudies () {
      if (!this.filter || this.filter.length < 2) {
        return this.orderedStudies
      }
      return this.searchableStudies.search(this.filter)
        .map(result => result.item)
    },
    searchableStudies () {
      return new Fuse(this.orderedStudies, {
        keys: ['name', 'description']
      })
    },
    orderedStudies () {
      // Get study order for all users from browser's local storage
      const allUsersStudyOrder = JSON.parse(localStorage.getItem('studyOrder'))
      // If no study order is present for the current user return the raw study list
      if (!allUsersStudyOrder || !allUsersStudyOrder[this.$auth.user.id]) { return this.studies }
      // Get study order for the current user
      const studyOrder = allUsersStudyOrder[this.$auth.user.id]
      // Apply the order to this.studies. Studies that are not in the list (e.g. new studies) get into first position.
      return [...this.studies].sort((a, b) => studyOrder.indexOf(a.id) - studyOrder.indexOf(b.id))
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
    // this.search = debounce(this.search, 200)
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
    async updateStudyOrder (newOrder) {
      // Get study order for all users from browser's local storage
      let allUsersStudyOrder = JSON.parse(localStorage.getItem('studyOrder'))
      if (!allUsersStudyOrder) { allUsersStudyOrder = {} }
      const updatedOrder = newOrder.map((study, i) => study.id)
      // Overwrite current user's study order
      allUsersStudyOrder[this.$auth.user.id] = updatedOrder
      localStorage.setItem('studyOrder', JSON.stringify(allUsersStudyOrder))
      await this.Study.update(newOrder)
    },
    /**
     *  Clear possible validation errors sent by adonis after closing the dialog.
     */
    clearErrors (val) {
      if (!val) {
        this.errors = { name: '', description: '' }
      }
    },
    search (term) {
      return this.searchableStudies.search(term)
    }
  }
}
</script>
