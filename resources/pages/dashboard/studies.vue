<template>
  <v-row no-gutters class="fill-height">
    <v-col cols="12" sm="4" lg="3" class="ml-n3 mt-n3 mb-n3">
      <studies-tabs />
    </v-col>
    <v-col cols="12" sm="8" lg="9">
      <nuxt-child />
    </v-col>
  </v-row>
</template>

<script>
export default {
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
