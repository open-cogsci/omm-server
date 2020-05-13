<template>
  <div>
    <new-study-dialog
      v-model="showDialog"
      v-bind.sync="newStudyData"
      :saving="saving"
      :errors.sync="errors"
      @clicked-save="saveNewStudy"
      @input="clearErrors"
    />
    <v-list class="py-0">
      <v-list-item
        class="success"
        dark
        @click="openNewStudyDialog"
      >
        <v-list-item-icon>
          <v-icon>mdi-plus</v-icon>
        </v-list-item-icon>
        <v-list-item-content>
          <v-list-item-title>Add a new study</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </v-list>

    <transition name="fade" mode="out-in">
      <v-list v-if="loading" key="loading" three-line class="py-0">
        <template v-for="i in 7">
          <v-skeleton-loader
            :key="i"
            :loading="loading"
            type="list-item-three-line"
          />
          <v-divider :key="`divider-${i}`" />
        </template>
      </v-list>
      <v-list v-else key="loaded" three-line class="py-0 fill-space">
        <template v-for="study in studies">
          <v-list-item :key="study.id" :to="`/dashboard/studies/${study.id}`" nuxt>
            <v-list-item-content class="px-3">
              <v-list-item-title v-text="study.name" />
              <v-list-item-subtitle v-text="study.description" />
            </v-list-item-content>
          </v-list-item>
          <v-divider :key="`divider-${study.id}`" />
        </template>
      </v-list>
    </transition>
  </div>
</template>

<script>
import { mapActions } from 'vuex'
import { isArray } from 'lodash'
import { STUDIES } from '@/assets/js/endpoints'

export default {
  components: {
    newStudyDialog: () => import('../NewStudyDialog')
  },
  data () {
    return {
      showDialog: false,
      loading: false,
      saving: false,
      studies: [],
      newStudyData: {
        name: '',
        description: ''
      },
      errors: {
        name: '',
        description: ''
      }
    }
  },
  created () {
    this.fetch()
  },
  methods: {
    ...mapActions('notifications', ['notify']),
    /**
     * Opens the study form
     * */
    openNewStudyDialog () {
      this.showDialog = true
    },
    async fetch () {
      this.loading = true
      try {
        const response = await this.$axios.get(STUDIES)
        this.studies = response.data
      } catch (e) {
        this.notify({
          message: e.response.data?.error?.message || 'Unspecified error',
          color: 'error'
        })
      } finally {
        this.loading = false
      }
    },
    /**
     *  Save a study
     */
    async saveNewStudy () {
      this.saving = true
      try {
        const response = await this.$axios.post(STUDIES, {
          name: this.newStudyData.name,
          description: this.newStudyData.description
        })
        const study = response.data
        this.studies.unshift(study)
        this.notify({ message: 'Study has been added', color: 'success' })
        this.showDialog = false
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
      const unexpectedError = e.response.data?.error?.message
      if (unexpectedError) {
        this.notify({
          message: e.response.data?.error?.message || 'Unspecified error',
          color: 'error'
        })
        return
      }
      if (isArray(e.response.data)) {
        const validationErrors = e.response.data
        for (const err of validationErrors) {
          this.errors[err.field] = err.validation
        }
        this.notify({
          message: 'There were some problems with your input. Please review the form.',
          color: 'error'
        })
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

<style lang="scss" scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity .2s;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}
.fill-space {
  height: calc(100vh - 268px);
  overflow: auto;
}
</style>
