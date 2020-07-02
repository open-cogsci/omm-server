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
                  </v-icon> 15
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
          <v-col cols="12" sm="6">
            <v-card>
              <v-card-title class="subtitle-1 blue-grey lighten-5">
                Data
              </v-card-title>
              <v-fade-transition leave-absolute>
                <participant-edit-data
                  v-if="editing === ptcp.id"
                  :participant="ptcp"
                  @clicked-cancel="editing = null"
                  @clicked-save="$emit('update-participant', $event)"
                />
                <participant-view-data
                  v-else
                  :participant="ptcp"
                  @clicked-edit="(id) => editing = id"
                />
              </v-fade-transition>
            </v-card>
          </v-col>
          <v-col cols="12" sm="6">
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
