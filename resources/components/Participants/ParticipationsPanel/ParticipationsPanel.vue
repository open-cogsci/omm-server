<template>
  <v-card outlined class="fill-height">
    <v-card-title class="subtitle-1 blue-grey lighten-5">
      {{ $t('participants.participations') }}
    </v-card-title>
    <v-card-text class="pa-0">
      <v-skeleton-loader
        :loading="loading"
        type="divided-list-item@5"
        :types="{'divided-list-item': 'list-item-two-line, divider'}"
      >
        <!-- With only a virtual scroll here, the skeleton loader never leaves the
                  loading state. Therefore there also is an empty div -->
        <div />
        <v-virtual-scroll
          v-if="participant.studies.length"
          :items="participant.studies"
          :item-height="80"
          height="340"
        >
          <template v-slot="{ item }">
            <v-list-item>
              <v-list-item-content>
                <v-list-item-title class="black--text" v-text="item.name" />
                <v-list-item-subtitle class="font-weight-medium" v-text="item.description" />
                <v-list-item-subtitle v-text="names(item.users)" />
              </v-list-item-content>
              <v-list-item-action>
                <v-list-item-action-text class="info--text">
                  <v-tooltip bottom>
                    <template v-slot:activator="{on, attrs}">
                      <div class="d-inline-block" v-bind="attrs" v-on="on">
                        <progress-circle :value="progress(item.id, participant.id)" />
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
</template>

<script>
export default {
  components: {
    ProgressCircle: () => import('@/components/common/ProgressCircle')
  },
  props: {
    participant: {
      type: Object,
      required: true
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    Participation () {
      return this.$store.$db().model('participations')
    }
  },
  methods: {
    progress (studyID, ptcpID) {
      // This is such an ugly hack, but inevitable with the belongsToMany bug that vuex-orm
      // experiences. Once that is fixed, this hoop is no longer necessary
      const edge = this.Participation.find([studyID, ptcpID])
      if (!edge.jobs_count) {
        return 0
      }
      return parseInt(edge.completed_jobs_count / edge.jobs_count * 100)
    },
    names (userList) {
      return userList.map(user => user.name).join(', ')
    }
  }
}
</script>
