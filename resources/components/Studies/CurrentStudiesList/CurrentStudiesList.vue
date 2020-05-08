<template>
  <div>
    <new-study-dialog
      v-model="showDialog"
      v-bind.sync="newStudyData"
      @clicked-save="saveNewStudy"
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
          <v-list-item-title>New study</v-list-item-title>
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
      <v-list v-else key="loaded" three-line>
        <template v-for="study in studies">
          <v-list-item :key="study.id">
            <v-list-item-content>
              <v-list-item-title v-text="study.name" />
              <v-list-item-subtitle v-text="study.description" />
            </v-list-item-content>
            <v-list-item-action>
              <v-list-item-action-text class="primary--text">
                <v-icon small color="primary">
                  mdi-account
                </v-icon> 33
              </v-list-item-action-text>
              <v-btn icon>
                <v-icon small color="primary">
                  mdi-archive
                </v-icon>
              </v-btn>
            </v-list-item-action>
          </v-list-item>
          <v-divider :key="`divider-${study.id}`" />
        </template>
      </v-list>
    </transition>
  </div>
</template>

<script>
import { mapActions } from 'vuex'
import { STUDIES } from '@/assets/js/endpoints'

export default {
  components: {
    newStudyDialog: () => import('../NewStudyDialog')
  },
  data () {
    return {
      showDialog: false,
      loading: false,
      studies: [],
      newStudyData: {
        name: '',
        description: ''
      }
    }
  },
  async created () {
    this.loading = true
    try {
      const response = await this.$axios.get(STUDIES)
      this.studies = response.data
    } catch (e) {
      this.notify({
        message: e.response.data?.error?.message || 'Unspecified error',
        color: 'error'
      })
    }

    this.loading = false
  },
  methods: {
    ...mapActions('notifications', ['notify']),
    openNewStudyDialog () {
      this.showDialog = true
    },
    saveNewStudy () {
      this.newStudyData.name = ''
      this.newStudyData.description = ''

      this.notify({ message: 'Study has been added', color: 'success' })
      this.showDialog = false
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
</style>
