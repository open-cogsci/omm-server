<template>
  <div>
    <v-toolbar color="secondary lighten-3" dark flat>
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

    <v-tabs-items v-model="openTab">
      <v-tab-item value="tab-current">
        <current-studies-list />
      </v-tab-item>
      <v-tab-item value="tab-archived">
        <archived-studies-list />
      </v-tab-item>
    </v-tabs-items>
  </div>
</template>

<script>
export default {
  components: {
    CurrentStudiesList: () => import('@/components/Studies/CurrentStudiesList'),
    ArchivedStudiesList: () => import('@/components/Studies/ArchivedStudiesList')
  },
  data () {
    return {
      openTab: 'tab-current'
    }
  }
}
</script>
