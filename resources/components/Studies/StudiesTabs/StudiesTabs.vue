<template>
  <v-row class="fill-height flex-column flex-nowrap">
    <v-toolbar color="primary" dark flat class="flex-grow-0">
      <v-spacer />
      <v-toolbar-title class="headline">
        Studies
      </v-toolbar-title>
      <v-spacer />
      <template v-slot:extension>
        <v-tabs v-model="openTab" grow centered slider-color="yellow">
          <v-tab :href="`#tab-current`">
            Current
          </v-tab>
          <v-tab :href="`#tab-archived`">
            Archived
          </v-tab>
        </v-tabs>
      </template>
    </v-toolbar>

    <v-tabs-items v-model="openTab" class="fill-height">
      <v-tab-item value="tab-current" class="fill-height">
        <current-studies />
      </v-tab-item>
      <v-tab-item value="tab-archived">
        <archived-studies />
      </v-tab-item>
    </v-tabs-items>
  </v-row>
</template>

<script>
export default {
  components: {
    CurrentStudies: () => import('@/components/Studies/CurrentStudies'),
    ArchivedStudies: () => import('@/components/Studies/ArchivedStudies')
  },
  data () {
    return {
      openTab: 'tab-current'
    }
  }
}
</script>
