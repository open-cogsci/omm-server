<template>
  <v-dialog
    :value="value"
    max-width="620px"
    scrollable
    @input="$emit('input', $event)"
  >
    <v-card>
      <v-card-title>
        Collaborators
      </v-card-title>
      <v-card-text class="body-1 font-weight-light">
        Share this experiment with other users
      </v-card-text>

      <v-fade-transition absolute mode="out-in">
        <v-card-text v-if="searchField" key="search">
          <user-searcher
            ref="userSearcher"
            :items="searchResults"
            :searching="searchingUsers"
            :users="users"
            :saving="saving"
            @query="$emit('query', $event)"
            @clicked-cancel="searchField = false"
            @clicked-add="$emit('add-user', $event)"
          />
        </v-card-text>
        <v-card-text
          v-else-if="collaborators.length"
          key="collabs"
          style="max-height: calc(100vh-250px);"
        >
          <div class="body-2">
            This experiment is currently shared with:
          </div>
          <v-expand-transition>
            <v-slide-y-transition
              group
              tag="v-list"
            >
              <v-list-item v-for="user of collaborators" :key="user.id">
                <v-list-item-content>
                  <v-row no-gutters align="center">
                    <v-col cols="8" md="9">
                      <v-list-item-title>
                        {{ user.name }}
                      </v-list-item-title>
                    </v-col>
                    <v-col cols="4" md="3">
                      <v-select
                        v-model="user.pivot.access_permission_id"
                        dense
                        :loading="savingAccess === user.id"
                        :items="accessLevels"
                        hide-details
                        @change="val => $emit('set-access-level', {userID: user.id, level: val})"
                      />
                    </v-col>
                  </v-row>
                </v-list-item-content>
                <v-list-item-action>
                  <v-btn icon :loading="deleting === user.id" @click="$emit('remove-user', user.id)">
                    <v-icon>mdi-delete</v-icon>
                  </v-btn>
                </v-list-item-action>
              </v-list-item>
            </v-slide-y-transition>
          </v-expand-transition>
        </v-card-text>
        <v-card-text v-else key="no-collabs">
          There are no collaborators for this experiment.
        </v-card-text>
      </v-fade-transition>

      <v-card-actions>
        <v-btn
          text
          color="primary"
          :disabled="searchField"
          @click="searchField = true"
        >
          <v-icon left>
            mdi-plus
          </v-icon>
          Add colloborator
        </v-btn>
        <v-spacer />
        <v-btn
          text
          @click="cancel"
        >
          Close
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  sync: ['search-field'],
  components: {
    UserSearcher: () => import('@/components/Users/UserSearcher')
  },
  props: {
    value: {
      type: Boolean,
      default: false
    },
    users: {
      type: Array,
      default: () => []
    },
    saving: {
      type: Boolean,
      default: false
    },
    deleting: {
      type: Number,
      default: null
    },
    savingAccess: {
      type: Number,
      default: null
    },
    formValid: {
      type: Boolean,
      default: true
    },
    searchResults: {
      type: Array,
      default: () => []
    },
    searchingUsers: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    collaborators () {
      return this.users?.filter(user => user.id !== this.$auth.user.id) || []
    },
    accessLevels () {
      return [
        { value: 1, text: this.$vuetify.breakpoint.smAndUp ? 'Can view' : 'View' },
        { value: 2, text: this.$vuetify.breakpoint.smAndUp ? 'Can edit' : 'Edit' }
      ]
    }
  },
  watch: {
    value (val) {
      if (val) {
        this.searchField = false
        this.search = ''
      }
    }
  },
  methods: {
    cancel () {
      this.$emit('input', false)
    }
  }
}
</script>
