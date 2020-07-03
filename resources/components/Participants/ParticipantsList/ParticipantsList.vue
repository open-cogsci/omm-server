<template>
  <v-expansion-panels popout>
    <v-expansion-panel v-for="(ptcp, i) in participants" :key="i">
      <v-expansion-panel-header v-slot="{ open }">
        <v-row no-gutters>
          <v-col cols="12" sm="4" class="text-truncate" :class="{'h2': open}">
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
              >
                <v-col cols="5">
                  <v-icon small>
                    mdi-tag
                  </v-icon> {{ ptcp.rfid }}
                </v-col>
                <v-col cols="5">
                  <v-icon small>
                    mdi-flask
                  </v-icon> {{ ptcp.studies_count }}
                </v-col>
                <v-col cols="2" class="text-center">
                  <span class="font-weight-light" :class="ptcp.active ? 'green--text':'red--text'">
                    {{ ptcp.active ? 'active':'inactive' }}
                  </span>
                </v-col>
              </v-row>
            </v-fade-transition>
          </v-col>
        </v-row>
      </v-expansion-panel-header>
      <v-expansion-panel-content>
        <v-row>
          <v-col cols="12" md="6">
            <v-card>
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
            <v-card class="fill-height">
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
