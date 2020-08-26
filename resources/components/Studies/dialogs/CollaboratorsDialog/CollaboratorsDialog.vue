<template>
  <v-dialog
    :value="value"
    max-width="620px"
    scrollable
    @input="$emit('input', $event)"
  >
    <v-card>
      <v-card-title>
        {{ $t('studies.dialogs.collaborators.title') }}
      </v-card-title>
      <v-card-text class="body-1 font-weight-light">
        {{ $t('studies.dialogs.collaborators.subtitle') }}
      </v-card-text>

      <v-fade-transition absolute mode="out-in">
        <smooth-reflow class="px-2">
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
              {{ $t('studies.dialogs.collaborators.currently_shared') }}:
            </div>

            <v-list>
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
            </v-list>
          </v-card-text>
          <v-card-text v-else key="no-collabs">
            {{ $t('studies.dialogs.collaborators.no_collaborators') }}.
          </v-card-text>
        </smooth-reflow>
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
          {{ $t('studies.dialogs.collaborators.add') }}
        </v-btn>
        <v-spacer />
        <v-btn
          text
          @click="cancel"
        >
          {{ $t('buttons.close') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  components: {
    UserSearcher: () => import('@/components/Users/UserSearcher')
  },
  sync: ['search-field'],
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
        {
          value: 1,
          text: this.$vuetify.breakpoint.smAndUp
            ? this.$t('studies.dialogs.collaborators.can_view')
            : this.$t('studies.dialogs.collaborators.can_view_short')
        },
        {
          value: 2,
          text: this.$vuetify.breakpoint.smAndUp
            ? this.$t('studies.dialogs.collaborators.can_edit')
            : this.$t('studies.dialogs.collaborators.can_edit_short')
        }
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
