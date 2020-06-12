<template>
  <h1 class="font-weight-thin">
    Please wait...
  </h1>
</template>

<script>
export default {
  layout: 'guest',
  mounted () {
    if (this.$auth.loggedIn) {
      this.$router.replace(this.localePath({ name: 'dashboard' }))
    } else {
      this.$router.replace(this.localePath({ name: 'login' }))
    }
  }
}
</script>
