<template>
  <v-row class="limit-height pt-3">
    <v-col cols="12" md="4" lg="3">
      <studies-tabs />
    </v-col>
    <v-col v-if="$vuetify.breakpoint.mdAndUp" cols="12" md="8" lg="9">
      <nuxt-child />
    </v-col>
    <study-page-dialog v-else v-model="dialog">
      <nuxt-child />
    </study-page-dialog>
  </v-row>
</template>

<script>
export default {
  name: 'StudyWrapper',
  components: {
    StudiesTabs: () => import('@/components/Studies/StudiesTabs'),
    StudyPageDialog: () => import('@/components/Studies/StudyPageDialog')
  },
  beforeRouteUpdate (to, from, next) {
    if (this.$vuetify.breakpoint.smAndDown && to.params.id !== from.params.id) {
      this.dialog = true
    }
    next()
  },
  data () {
    return {
      dialog: false
    }
  },
  head () {
    return {
      title: 'Studies'
    }
  }
}
</script>

<style lang="scss">
  .limit-height {
    height: calc(100% + 32px);
    overflow: auto;
  }
</style>
