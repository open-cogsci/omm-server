<template>
  <v-expansion-panels v-model="panel" popout>
    <v-expansion-panel v-for="user in users" :key="user.id">
      <v-expansion-panel-header v-slot="{ open }">
        <v-row no-gutters>
          <v-col cols="12" sm="4" class="text-truncate" :class="{'h2': open}">
            {{ user.name }}
          </v-col>
          <v-col
            sm="8"
            class="text--secondary hidden-xs-only"
          >
            <v-fade-transition leave>
              <v-row
                v-if="!open"
                no-gutters
                style="width: 100%"
              >
                <v-col cols="5">
                  {{ user.email }}
                </v-col>
                <v-col cols="3">
                  Admin
                </v-col>
                <v-col cols="2">
                  <v-tooltip left>
                    <template v-slot:activator="{ on, attrs }">
                      <v-icon
                        small
                        v-bind="attrs"
                        v-on="on"
                      >
                        mdi-flask
                      </v-icon>
                    </template>
                    Studies
                  </v-tooltip>{{ user.studies_count }}
                </v-col>
                <v-col cols="2" class="text-center">
                  <v-tooltip left>
                    <template v-slot:activator="{ on, attrs }">
                      <span
                        class="font-weight-light"
                        :class="user.active ? 'green--text':'red--text'"
                        v-bind="attrs"
                        v-on="on"
                      >
                        {{ user.active ? 'active':'inactive' }}
                      </span>
                    </template>
                    Status
                  </v-tooltip>
                </v-col>
              </v-row>
            </v-fade-transition>
          </v-col>
        </v-row>
      </v-expansion-panel-header>
      <v-expansion-panel-content>
        <v-row>
          <v-col cols="12" md="6">
            <v-card outlined>
              <v-card-title class="subtitle-1 blue-grey lighten-5">
                Properties
              </v-card-title>
              <div class="mt-5">
                <v-fade-transition mode="out-in">
                  <user-edit-data
                    v-if="editing === user.id"
                    :user="user"
                    :saving="saving"
                    :errors="errors"
                    @clicked-cancel="editing = null"
                    @clicked-save="$emit('update-user', $event)"
                    @update:errors="$emit('update:errors', $event)"
                  />
                  <user-view-data
                    v-else
                    :user="user"
                    :deleting="deleting"
                    style="width: 100%"
                    @clicked-edit="(id) => editing = id"
                    @clicked-delete="$emit('delete-user', $event)"
                  />
                </v-fade-transition>
              </div>
            </v-card>
          </v-col>
          <v-col cols="12" md="6">
            <v-card outlined class="fill-height">
              <v-card-title class="subtitle-1 blue-grey lighten-5">
                Studies
              </v-card-title>
              <v-card-text />
            </v-card>
          </v-col>
        </v-row>
      </v-expansion-panel-content>
    </v-expansion-panel>
  </v-expansion-panels>
</template>

<script>
export default {
  components: {
    UserViewData: () => import('@/components/Users/UserViewData'),
    UserEditData: () => import('@/components/Users/UserEditData')
  },
  props: {
    users: {
      type: Array,
      default: () => []
    },
    saving: {
      type: Boolean,
      default: false
    },
    deleting: {
      type: Boolean,
      default: false
    },
    errors: {
      type: Object,
      default: () => ({})
    }
  },
  data () {
    return {
      panel: [],
      editing: null
    }
  },
  methods: {
    clearEditing () {
      this.editing = null
    }
  }
}
</script>
