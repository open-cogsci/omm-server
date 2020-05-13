<template>
  <v-list three-line class="py-0" style="overflow-x: hidden; overflow-y: auto">
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
          <v-list-item :key="study.id" :to="`/dashboard/studies/${study.id}`">
            <v-list-item-content class="px-3">
              <v-list-item-title v-text="study.name" />
              <v-list-item-subtitle v-text="study.description" />
            </v-list-item-content>
          </v-list-item>
          <v-divider :key="`divider-${study.id}`" />
        </template>
      </div>
    </transition>
  </v-list>
</template>

<script>
import { STUDIES } from '@/assets/js/endpoints'

export default {
  data () {
    return {
      loading: false,
      studies: []
    }
  },
  created () {
    this.fetch()
  },
  methods: {
    async fetch () {
      this.loading = true
      try {
        const response = await this.$axios.get(STUDIES, { params: { active: false } })
        this.studies = response.data
      } catch (e) {
        this.notify({
          message: e.response.data?.error?.message || 'Unspecified error',
          color: 'error'
        })
      }
      this.loading = false
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
  max-height: calc(100vh - 336px);
  overflow-x: hidden;
  overflow-y: scroll
}
</style>
