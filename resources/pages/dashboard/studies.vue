<template>
  <v-row class="limit-height">
    <v-col cols="12" md="4" xl="3" class="py-0">
      <studies-tabs />
    </v-col>
    <v-col v-if="$vuetify.breakpoint.mdAndUp" cols="12" md="8" xl="9">
      <nuxt-child />
    </v-col>
    <study-page-dialog v-model="dialog" else>
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
  data () {
    return {
      dialog: false
    }
  },
  head () {
    return {
      title: 'Studies'
    }
  },
  beforeRouteUpdate (to, from, next) {
    if (this.$vuetify.breakpoint.smAndDown && to.params.id !== from.params.id) {
      this.dialog = true
    }
    next()
  }
}
</script>

<style lang="scss">
  .limit-height {
    height: calc(100% + 24px);
  }
</style>
