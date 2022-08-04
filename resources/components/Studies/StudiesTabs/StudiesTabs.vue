<template>
  <v-row class="fill-height flex-column flex-nowrap">
    <v-toolbar color="primary" dark flat class="flex-grow-0">
      <v-spacer />
      <v-toolbar-title class="headline">
        {{ $t('layout.nav.studies') }}
      </v-toolbar-title>
      <v-spacer />
      <template #extension>
        <v-tabs v-model="openTab" grow centered slider-color="yellow">
          <v-tab :href="`#tab-current`">
            {{ $t('studies.list.current') }}
          </v-tab>
          <v-tab :href="`#tab-archived`">
            {{ $t('studies.list.archived') }}
          </v-tab>
        </v-tabs>
      </template>
    </v-toolbar>

    <v-col class="py-0 my-0 pr-0">
      <v-text-field
        v-model="search"
        solo
        hide-details
        prepend-inner-icon="mdi-magnify"
        clearable
        :label="$t('studies.list.search')"
      />
    </v-col>

    <v-tabs-items v-model="openTab" class="fill-height">
      <v-tab-item value="tab-current" class="fill-height">
        <current-studies :filter="search" />
      </v-tab-item>
      <v-tab-item value="tab-archived">
        <archived-studies :filter="search" />
      </v-tab-item>
    </v-tabs-items>
  </v-row>
</template>

<script>
import CurrentStudies from '@/components/Studies/CurrentStudies'
import ArchivedStudies from '@/components/Studies/ArchivedStudies'
export default {
  components: {
    CurrentStudies,
    ArchivedStudies
  },
  data () {
    return {
      search: '',
      openTab: 'tab-current'
    }
  }
}
</script>
