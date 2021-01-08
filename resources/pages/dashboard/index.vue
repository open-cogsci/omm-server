<template>
  <v-container class="fill-height py-0">
    <v-row class="fill-height">
      <v-col cols="12" class="d-flex flex-column fill-height">
        <v-row style="max-height: 64px">
          <v-col cols="12">
            <h1 class="display-1 font-weight-light">
              {{ $t('layout.nav.dashboard') }}
            </h1>
          </v-col>
        </v-row>
        <v-row class="fill-height">
          <v-col cols="12" sm="6" xl="4" :style="colStyle">
            <v-card class="fill-height" style="overflow: auto">
              <v-card-title class="font-weight-normal">
                {{ $t('dashboard.title.most_recent_ptcp') }}
              </v-card-title>
              <v-card-text class="px-0">
                <v-skeleton-loader
                  :loading="loading.mostRecentPtcp"
                  type="list-item-two-line@5"
                >
                  <v-list v-if="mostRecentPtcp.length">
                    <v-list-item v-for="item of mostRecentPtcp" :key="item.identifier">
                      <v-list-item-content>
                        <v-list-item-title>
                          {{ item.participant }}
                          <span class="caption grey--text text--darken-1">
                            ({{ item.identifier }})
                          </span>
                          to <span class="font-weight-medium">{{ item.study }}</span>
                        </v-list-item-title>
                        <v-list-item-subtitle>
                          {{ distanceFromNow(item.occurrence) }}
                        </v-list-item-subtitle>
                      </v-list-item-content>
                    </v-list-item>
                  </v-list>
                  <div v-else class="px-4 text-subtitle-1 font-weight-light">
                    {{ $t('dashboard.no_recent_ptcps') }}
                  </div>
                </v-skeleton-loader>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" sm="6" xl="4" :style="colStyle">
            <v-card class="fill-height">
              <v-card-title>
                {{ $t('dashboard.title.most_active_studies') }}&nbsp;
                <span class="text-subtitle-1 font-weight-light">
                  {{ $t('dashboard.title.period').replace('{days}', days) }}
                </span>
              </v-card-title>
              <v-card-text class="px-0">
                <v-skeleton-loader
                  :loading="loading.mostActiveStudies"
                  type="list-item-two-line@5"
                >
                  <v-list v-if="mostActiveStudies.length">
                    <v-list-item
                      v-for="item of mostActiveStudies"
                      :key="item.identifier"
                      :to="localePath(`/dashboard/studies/${item.id}`)"
                      nuxt
                    >
                      <v-list-item-content>
                        <v-list-item-title>
                          {{ item.name }}
                        </v-list-item-title>
                        <v-list-item-subtitle>
                          {{ item.participations }} {{ $t('dashboard.jobs_performed') }}
                        </v-list-item-subtitle>
                      </v-list-item-content>
                    </v-list-item>
                  </v-list>
                  <div v-else class="px-4 text-subtitle-1 font-weight-light">
                    {{ $t('dashboard.no_studies') }}
                  </div>
                </v-skeleton-loader>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" sm="6" xl="4" :style="colStyle">
            <v-card class="fill-height">
              <v-card-title>
                {{ $t('dashboard.title.most_active_ptcp') }}&nbsp;
                <span class="text-subtitle-1 font-weight-light">
                  {{ $t('dashboard.title.period').replace('{days}', days) }}
                </span>
              </v-card-title>
              <v-card-text class="px-0">
                <v-skeleton-loader
                  :loading="loading.mostActiveParticipants"
                  type="list-item-two-line@5"
                >
                  <v-list v-if="mostActiveParticipants.length">
                    <v-list-item
                      v-for="item of mostActiveParticipants"
                      :key="item.identifier"
                    >
                      <v-list-item-content>
                        <v-list-item-title>
                          {{ item.name }}
                          <span class="grey--text text--darken-1 caption">({{ item.identifier }})</span>
                        </v-list-item-title>
                        <v-list-item-subtitle>
                          {{ item.participations }} {{ $t('dashboard.jobs_performed') }}
                        </v-list-item-subtitle>
                      </v-list-item-content>
                    </v-list-item>
                  </v-list>
                  <div v-else class="px-4 text-subtitle-1 font-weight-light">
                    {{ $t('dashboard.no_ptcps') }}
                  </div>
                </v-skeleton-loader>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" sm="6" xl="12" :style="colStyle">
            <v-card class="fill-height d-flex flex-column">
              <v-card-title class="pb-0 mb-0">
                <div>
                  {{ $t('dashboard.title.trend.main').replace('{days}', days) }}<br>
                  <span class="font-weight-light text-subtitle-1">
                    {{ $t('dashboard.title.trend.sub') }}
                  </span>
                </div>
              </v-card-title>

              <v-card-text class="d-flex flex-column justify-center fill-height">
                <v-skeleton-loader
                  :loading="loading.trend"
                  type="card"
                  transition="fade-transition"
                >
                  <v-sparkline v-bind="sparkline" />
                </v-skeleton-loader>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapActions } from 'vuex'
import { formatDistanceToNow } from 'date-fns'
import { nl, fr } from 'date-fns/locale'
import { processErrors } from '@/assets/js/errorhandling'

export default {
  name: 'DashboardIndex',
  data () {
    return {
      trend: { values: [], labels: [] },
      mostRecentPtcp: [],
      mostActiveStudies: [],
      mostActiveParticipants: [],
      days: 7,
      loading: {
        mostRecentPtcp: false,
        mostActiveStudies: false,
        mostActiveParticipants: false,
        trend: false
      }
    }
  },
  head () {
    return {
      title: 'Dashboard'
    }
  },
  computed: {
    Participation () {
      return this.$store.$db().model('participations')
    },
    sparkline () {
      return {
        value: this.trend?.values || [],
        labels: this.trend?.labels || [],
        padding: this.$vuetify.breakpoint.xlOnly ? 8 : 16,
        radius: 10,
        labelSize: this.$vuetify.breakpoint.xlOnly ? 3 : 9,
        lineCap: 'round',
        smooth: true,
        gradient: ['red', 'orange', 'lightGreen'],
        gradientDirection: 'bottom',
        lineWidth: this.$vuetify.breakpoint.xlOnly ? 1 : 3,
        autoLineWidth: true,
        height: this.$vuetify.breakpoint.xlOnly ? '50%' : '100%',
        type: 'trend',
        autoDraw: true
      }
    },
    colStyle () {
      return this.$vuetify.breakpoint.smAndUp
        ? {
            height: '50%'
          }
        : {}
    }
  },
  created () {
    this.fetchAll()
  },
  methods: {
    ...mapActions('notifications', ['notify']),
    fetchAll () {
      this.fetchMostRecentPtcp()
      this.fetchDaysTrend()
      this.fetchMostActiveStudies()
      this.fetchmostActivePtcp()
    },
    async fetchMostRecentPtcp () {
      this.loading.mostRecentPtcp = true
      try {
        this.mostRecentPtcp = await this.Participation.mostRecent()
      } catch (e) {
        processErrors(e, this.notify)
      } finally {
        this.loading.mostRecentPtcp = false
      }
    },
    async fetchDaysTrend () {
      this.loading.trend = true
      try {
        this.trend = await this.Participation.trend(
          { params: { days: this.days } })
      } catch (e) {
        processErrors(e, this.notify)
      } finally {
        this.loading.trend = false
      }
    },
    async fetchMostActiveStudies () {
      this.loading.mostActiveStudies = true
      try {
        this.mostActiveStudies = await this.Participation.mostActiveStudies(
          { params: { days: this.days } })
      } catch (e) {
        processErrors(e, this.notify)
      } finally {
        this.loading.mostActiveStudies = false
      }
    },
    async fetchmostActivePtcp () {
      this.loading.mostActiveParticipants = true
      try {
        this.mostActiveParticipants = await this.Participation.mostActiveParticipants(
          { params: { days: this.days } })
      } catch (e) {
        processErrors(e, this.notify)
      } finally {
        this.loading.mostActiveParticipants = false
      }
    },
    distanceFromNow (val) {
      const locale = {
        en: null,
        fr,
        nl
      }[this.$i18n.locale]
      return formatDistanceToNow(new Date(val), { addSuffix: true, locale })
    }
  }
}
</script>
