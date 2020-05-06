<template>
  <div>
    <v-list class="py-0">
      <v-list-item
        class="success"
        dark
        @click="openNewStudyModal"
      >
        <v-list-item-icon>
          <v-icon>mdi-plus</v-icon>
        </v-list-item-icon>
        <v-list-item-content>
          <v-list-item-title>New study</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </v-list>
    <v-list three-line class="py-0">
      <transition name="fade" mode="out-in">
        <div v-if="loading" key="loading">
          <template v-for="i in 7">
            <v-skeleton-loader
              :key="i"
              :loading="loading"
              type="list-item-three-line"
            />
            <v-divider :key="`divider-${i}`" />
          </template>
        </div>
        <div v-else key="loaded">
          <template v-for="study in studies">
            <v-list-item :key="study.id">
              <v-list-item-content>
                <v-list-item-title v-text="study.name" />
                <v-list-item-subtitle v-text="study.description" />
              </v-list-item-content>
            </v-list-item>
            <v-divider :key="`divider-${study.id}`" />
          </template>
        </div>
      </transition>
    </v-list>
  </div>
</template>

<script>
import { mapActions } from 'vuex'
import { STUDIES } from '@/assets/js/endpoints'

export default {
  data () {
    return {
      loading: false,
      studies: []
    }
  },
  async created () {
    this.loading = true
    try {
      const response = await this.$axios.get(STUDIES, { active: true })
      this.studies = response.data
    } catch (e) {
      this.notify(e.response.data?.error?.message || 'Unspecified error', { color: 'error' })
    }

    this.loading = false
  },
  methods: {
    ...mapActions('notifications', ['notify']),
    openNewStudyModal () {

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
