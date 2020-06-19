<template>
  <nuxt-child />
</template>

<script>
export default {
  name: 'DashboardWrapper',
  middleware: ['auth']
}
</script>
