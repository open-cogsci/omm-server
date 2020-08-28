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
        <v-row style="max-height: 50%">
          <v-col cols="12" sm="6">
            <v-card class="fill-height">
              <v-card-title>Most frequent participations</v-card-title>
              <v-card-text>
                <v-skeleton-loader :loading="loading.freq" type="list" transition="scale-transition">
                  <v-list />
                </v-skeleton-loader>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" sm="6">
            <v-card class="fill-height">
              <v-card-title>Most active studies</v-card-title>
              <v-card-text>Body</v-card-text>
            </v-card>
          </v-col>
        </v-row>
        <v-row style="max-height: 50%">
          <v-col cols="12" sm="6">
            <v-card class="fill-height">
              <v-card-title>Participation trend</v-card-title>
              <v-card-title class="font-weight-light text-subtitle-1 text-md-h6">
                Trend of participations to all of your studies over at most 7 days.
              </v-card-title>
              <v-card-text>
                <v-skeleton-loader :loading="loading.trend" type="card" transition="fade-transition">
                  <v-sparkline
                    v-bind="sparkline"
                    type="trend"
                    auto-draw
                  />
                </v-skeleton-loader>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" sm="6">
            <v-card class="fill-height">
              <v-card-title>Most active participants</v-card-title>
              <v-card-text>Body</v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapActions } from 'vuex'
import { processErrors } from '@/assets/js/errorhandling'

export default {
  name: 'DashboardIndex',
  data () {
    return {
      trend: {},
      freq: {},
      loading: {
        freq: false,
        activeStudies: false,
        activeParticipants: false,
        trend: false
      }
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
        height: 100,
        padding: 16,
        radius: 10,
        labelSize: this.$vuetify.breakpoint.xsOnly ? 10 : 7,
        lineCap: 'round',
        smooth: true,
        gradient: ['red', 'orange', 'lightGreen'],
        gradientDirection: 'bottom',
        lineWidth: 2,
        autoLineWidth: true
      }
    }
  },
  created () {
    this.fetchAll()
  },
  methods: {
    ...mapActions('notifications', ['notify']),
    fetchAll () {
      this.fetchFreqPtcp()
      this.fetch7dayTrend()
      this.fetchMostActiveStudies()
      this.fetchmostActivePtcp()
    },
    async fetchFreqPtcp () {
      this.loading.freq = true
      try {
        this.freq = await this.Participation.mostFrequent()
      } catch (e) {
        processErrors(e, this.notify)
      } finally {
        this.loading.freq = false
      }
    },
    async fetch7dayTrend () {
      this.loading.trend = true
      try {
        this.trend = await this.Participation.trend()
      } catch (e) {
        processErrors(e, this.notify)
      } finally {
        this.loading.trend = false
      }
    },
    async fetchMostActiveStudies () {

    },
    async fetchmostActivePtcp () {

    }
  },
  head () {
    return {
      title: 'Dashboard'
    }
  }
}
</script>
