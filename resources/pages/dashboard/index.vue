<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1 class="display-1 font-weight-light">
          {{ $t('layout.nav.dashboard') }}
        </h1>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: 'DashboardIndex',
  head () {
    return {
      title: 'Dashboard'
    }
  }
}
</script>
