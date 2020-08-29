<template>
  <v-expansion-panels v-model="panel" popout hover>
    <v-expansion-panel v-for="ptcp in participants" :key="ptcp.id">
      <v-expansion-panel-header v-slot="{ open }">
        <v-row no-gutters>
          <v-col
            cols="12"
            sm="4"
            class="text-truncate text-body-2 text-md-body-1"
            :class="{'font-weight-bold': open}"
          >
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
                    {{ $t('participants.identifier') }}
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
                    {{ $t('participants.participations') }}
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
                        {{ (ptcp.active
                          ? $t('participants.active')
                          : $t('participants.inactive')) | lowercase }}
                      </span>
                    </template>
                    {{ $t('participants.status') }}
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
            <v-card outlined class="fill-height d-flex flex-column" height="400">
              <v-card-title class="subtitle-1 blue-grey lighten-5">
                {{ $t('common.properties') }}
              </v-card-title>
              <v-fade-transition mode="out-in" class="mt-5">
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
            </v-card>
          </v-col>
          <v-col cols="12" md="6">
            <v-card outlined class="fill-height">
              <v-card-title class="subtitle-1 blue-grey lighten-5">
                {{ $t('participants.participations') }}
              </v-card-title>
              <v-card-text class="pa-0">
                <v-skeleton-loader
                  :loading="loadingParticipant === ptcp.id"
                  type="divided-list-item@5"
                  :types="{'divided-list-item': 'list-item-two-line, divider'}"
                >
                  <!-- With only a virtual scroll here, the skeleton loader never leaves the
                  loading state. Therefore there also is an empty div -->
                  <div />
                  <v-virtual-scroll
                    v-if="ptcp.studies.length"
                    :items="ptcp.studies"
                    :item-height="65"
                    height="340"
                  >
                    <template v-slot="{ item }">
                      <v-list-item>
                        <v-list-item-content>
                          <v-list-item-title v-text="item.name" />
                          <v-list-item-subtitle v-text="item.description" />
                        </v-list-item-content>
                        <v-list-item-action>
                          <v-list-item-action-text class="info--text">
                            <v-tooltip bottom>
                              <template v-slot:activator="{on, attrs}">
                                <div class="d-inline-block" v-bind="attrs" v-on="on">
                                  <progress-circle :value="progress(item.id, ptcp.id)" />
                                </div>
                              </template>
                              {{ $t('stats.progress') }}
                            </v-tooltip>
                          </v-list-item-action-text>
                        </v-list-item-action>
                      </v-list-item>
                      <v-divider :key="`divider-${item.id}`" />
                    </template>
                  </v-virtual-scroll>

                  <v-list-item v-else>
                    <v-list-item-content>
                      <v-list-item-title class="font-weight-light text-center">
                        {{ $t('participants.no_studies') }}
                      </v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                </v-skeleton-loader>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-expansion-panel-content>
    </v-expansion-panel>
  </v-expansion-panels>
</template>

<script>
import { lowerCase, isNumber } from 'lodash'

export default {
  components: {
    ParticipantViewData: () => import('@/components/Participants/ParticipantViewData'),
    ParticipantEditData: () => import('@/components/Participants/ParticipantEditData'),
    ProgressCircle: () => import('@/components/common/ProgressCircle')
  },
  filters: {
    lowercase: val => lowerCase(val)
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
    loadingParticipant: {
      type: Number,
      default: 0
    },
    errors: {
      type: Object,
      default: () => ({})
    }
  },
  data () {
    return {
      panel: null,
      editing: null
    }
  },
  computed: {
    Participation () {
      return this.$store.$db().model('participations')
    }
  },
  watch: {
    panel (val) {
      if (isNumber(val)) {
        this.$emit('load-participant', this.participants[val].id)
      }
    }
  },
  methods: {
    clearEditing () {
      this.editing = null
    },
    progress (studyID, ptcpID) {
      // This is such an ugly hack, but inevitable with the belongsToMany bug that vuex-orm
      // experiences. Once that is fixed, this hoop is no longer necessary
      const edge = this.Participation.find([studyID, ptcpID])
      if (!edge.jobs_count) {
        return 0
      }
      return parseInt(edge.completed_jobs_count / edge.jobs_count * 100)
    }
  }
}
</script>
