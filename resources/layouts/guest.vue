<template>
  <v-app>
    <v-container class="fill-height">
      <v-row class="align-center justify-center fill-height flex-column">
        <nuxt />
        <language-switcher />
      </v-row>
    </v-container>
  </v-app>
</template>

<script>
export default {
  components: {
    LanguageSwitcher: () => import('@/components/LanguageSwitcher')
  },
  data () {
    return {}
  }
}
</script>
