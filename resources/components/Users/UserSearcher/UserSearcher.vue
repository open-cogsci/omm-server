<template>
  <v-row align="center">
    <v-col cols="12" sm="9">
      <v-autocomplete
        v-model="selected"
        :items="items"
        :search-input.sync="search"
        :loading="searching"
        :filter="userFilter"
        outlined
        prepend-icon="mdi-account-search"
        :label="$t('studies.dialogs.collaborators.search')"
        hide-no-data
        hide-selected
        hide-details
        cache-items
        return-object
      />
    </v-col>
    <v-col cols="12" sm="3" class="text-right">
      <v-item-group class="v-btn-toggle">
        <v-btn :disabled="!selected" :loading="saving" color="primary" @click="add">
          <v-icon color="white">
            mdi-plus
          </v-icon>
        </v-btn>
        <v-btn :disabled="saving" @click="cancel">
          <v-icon>mdi-cancel</v-icon>
        </v-btn>
      </v-item-group>
    </v-col>
  </v-row>
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
    },
    saving: {
      type: Boolean,
      default: false
    },
    users: {
      type: Array,
      default: () => []
    }
  },
  data () {
    return {
      search: '',
      selected: null
    }
  },
  computed: {
    collabIDs () {
      return this.users.map(user => user.id)
    }
  },
  watch: {
    search (val) {
      val && val !== this.user?.text && this.$emit('query', val)
    }
  },
  methods: {
    clear () {
      this.selected = null
    },
    cancel () {
      this.clear()
      this.$emit('clicked-cancel')
    },
    userFilter (item) {
      // Leave away users that are already among the collaborators
      return !this.collabIDs.includes(item.value)
    },
    add () {
      this.selected && this.$emit('clicked-add', this.selected.value)
    }
  }
}
</script>
