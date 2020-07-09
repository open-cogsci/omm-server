<template>
  <v-expansion-panels v-model="panel" popout>
    <v-expansion-panel v-for="ptcp in participants" :key="ptcp.id">
      <v-expansion-panel-header v-slot="{ open }">
        <v-row no-gutters>
          <v-col cols="12" sm="4" class="text-truncate text-body-2" :class="{'font-weight-bold': open}">
            {{ ptcp.name }}
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
                class="text-caption text-md-body-2"
              >
                <v-col cols="5">
                  <v-tooltip left>
                    <template v-slot:activator="{ on, attrs }">
                      <v-icon
                        small
                        v-bind="attrs"
                        v-on="on"
                      >
                        mdi-tag
                      </v-icon>
                    </template>
                    Identifier
                  </v-tooltip>
                  {{ ptcp.identifier }}
                </v-col>
                <v-col cols="5">
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
                    Participations
                  </v-tooltip>{{ ptcp.studies_count }}
                </v-col>
                <v-col cols="2" class="text-center">
                  <v-tooltip left>
                    <template v-slot:activator="{ on, attrs }">
                      <span
                        class="font-weight-light"
                        :class="ptcp.active ? 'green--text':'red--text'"
                        v-bind="attrs"
                        v-on="on"
                      >
                        {{ ptcp.active ? 'active':'inactive' }}
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
                  <participant-edit-data
                    v-if="editing === ptcp.id"
                    :participant="ptcp"
                    :saving="saving"
                    :errors="errors"
                    @clicked-cancel="editing = null"
                    @clicked-save="$emit('update-participant', $event)"
                    @update:errors="$emit('update:errors', $event)"
                  />
                  <participant-view-data
                    v-else
                    :participant="ptcp"
                    :deleting="deleting"
                    style="width: 100%"
                    @clicked-edit="(id) => editing = id"
                    @clicked-delete="$emit('delete-participant', $event)"
                  />
                </v-fade-transition>
              </div>
            </v-card>
          </v-col>
          <v-col cols="12" md="6">
            <v-card outlined class="fill-height">
              <v-card-title class="subtitle-1 blue-grey lighten-5">
                Participations
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
    ParticipantViewData: () => import('@/components/Participants/ParticipantViewData'),
    ParticipantEditData: () => import('@/components/Participants/ParticipantEditData')
  },
  props: {
    participants: {
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
