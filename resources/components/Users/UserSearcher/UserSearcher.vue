<template>
  <v-autocomplete
    v-model="user"
    :items="items"
    :search-input.sync="search"
    :loading="searching"
    outlined
    prepend-icon="mdi-account-search"
    label="Search user"
    hide-no-data
    hide-selected
    cache-items
    return-object
  />
</template>

<script>
export default {
  props: {
    items: {
      type: Array,
      default: () => []
    },
    searching: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      search: '',
      user: {}
    }
  },
  watch: {
    search (val) {
      val && val !== this.user?.text && this.$emit('query', val)
    },
    select () {
      this.user && this.$emit('select-user', this.user.id)
    }
  }
}
</script>
