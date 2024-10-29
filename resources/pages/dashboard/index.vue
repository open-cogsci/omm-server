<template>
  <v-container class="fill-height">
    <v-row class="fill-height">
      <v-col cols="12">
        <v-row style="max-height: 64px">
          <v-col cols="12">
            <h1 class="display-1 font-weight-light">
              {{ $t('layout.nav.dashboard') }}
            </h1>
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="6" :style="colStyle">
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
                  <v-list
                    v-if="mostActiveStudies.length"
                    max-height="30vh"
                    class="overflow-y-auto"
                  >
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
          <v-col cols="6" :style="colStyle">
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
                  <v-list
                    v-if="mostActiveParticipants.length"
                    max-height="30vh"
                    class="overflow-y-auto"
                  >
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
        </v-row>

        <v-row>
          <v-col cols="12">
            <v-card>
              <v-card-title class="d-flex">
                <div class="me-auto">
                  Participation trend<br>
                  <span class="font-weight-light text-subtitle-1">
                    of all your current studies taken together
                  </span>
                </div>
                <div>
                  <v-select
                    v-model="trendType"
                    dense
                    outlined
                    hide-details
                    label="Select type"
                    :items="trendSelectorItems"
                    @input="fetchTrend"
                  />
                </div>
              </v-card-title>
              <v-card-text>
                <v-skeleton-loader
                  :loading="loading.trend"
                  type="card"
                >
                  <v-sparkline v-bind="sparkline" />
                  <v-simple-table class="trend-table">
                    <thead>
                      <tr>
                        <th
                          v-for="item in trendTable"
                          :key="item.label"
                          class="text-center"
                        >
                          {{ item.label }}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td
                          v-for="item in trendTable"
                          :key="item.label"
                          class="text-center"
                        >
                          {{ item.value }}
                        </td>
                      </tr>
                    </tbody>
                  </v-simple-table>
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
      trendType: 'week',
      trend: { values: [], labels: [] },
      trendTable: [],
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
        padding: 0,
        showLabels: false,
        autoLineWidth: false,
        height: '35vh',
        type: 'bar'
      }
    },
    colStyle () {
      return this.$vuetify.breakpoint.smAndUp
        ? {
            height: '50%'
          }
        : {}
    },
    trendSelectorItems () {
      return [
        {
          value: 'day',
          text: 'Past day'
        },
        {
          value: 'week',
          text: 'Past week'
        },
        {
          value: 'month',
          text: 'Past month'
        },
        {
          value: 'year',
          text: 'Past year'
        }
      ]
    }
  },
  created () {
    this.fetchAll()
  },
  methods: {
    ...mapActions('notifications', ['notify']),
    fetchAll () {
      this.fetchMostRecentPtcp()
      this.fetchTrend()
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
    async fetchTrend () {
      this.loading.trend = true
      try {
        this.trend = await this.Participation.trend(
          { params: { type: this.trendType } })
        this.trendTable = this.trend.labels.map((l, i) => {
          return { label: l, value: this.trend.values[i] }
        })
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
