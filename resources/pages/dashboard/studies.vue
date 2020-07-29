<template>
  <v-row class="limit-height">
    <v-col cols="12" md="4" xl="3" class="py-0">
      <studies-tabs />
    </v-col>
    <v-col cols="12" md="8" xl="9">
      <nuxt-child />
    </v-col>
  </v-row>
</template>

<script>
export default {
  name: 'StudyWrapper',
  components: {
    StudiesTabs: () => import('@/components/Studies/StudiesTabs')
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
    height: calc(100% + 24px);
  }
</style>
