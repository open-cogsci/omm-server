<template>
  <v-card outlined class="fill-height d-flex flex-column">
    <v-card-title>
      {{ $t('study_participants.stats.title') }}
    </v-card-title>
    <v-card-text>
      <v-row id="participants-stats" class="fill-height">
        <v-col cols="6" class="pb-5">
            <p class="text-subtitle-2 secondary--text">
              {{ $t('stats.overview') }}
            </p>
            <v-row v-for="line of overview" :key="line.label" :class="line.classes" no-gutters>
              <v-col v-bind="labelColSizes">
                {{ line.label }}
              </v-col>
              <v-col v-bind="valueColSizes">
                {{ line.value }}
              </v-col>
            </v-row>
          </v-col>
          <v-col cols="6" class="pb-5">
            <p class="text-subtitle-2 secondary--text">
            {{ $t('stats.progress') }}
          </p>
          <v-progress-circular
            class="text-center"
            rotate="-90"
            :size="175"
            :value="studyProgress"
            color="green"
            :width="25"
            >
            <div>
              <div class="text-h4 text-md-h2">
                {{ Math.round(studyProgress) }}
                <span class="caption">%</span>
              </div>
              <div class="caption">
                {{ $t('stats.complete') }}
              </div>
            </div>
          </v-progress-circular>
        </v-col>

        <v-col cols="12">
          <p class="text-subtitle-2 secondary--text">
            {{ $t('stats.trend') }}
          </p>
          <v-sparkline
          v-bind="sparkline"
          type="trend"
          auto-draw
          />
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script>
import { processErrors } from '@/assets/js/errorhandling'

export default {
  props: {
    study: {
      type: Object,
      default: () => null
    }
  },
  data () {
    return {
      labelColSizes: { cols: 6, sm: 7, lg: 8, xl: 6 },
      valueColSizes: { cols: 6, sm: 5, lg: 4, xl: 6 },
      loading: {
        stats: false
      },
      stats: {}
    }
  },
  computed: {
    studyProgress () {
      if (!this.stats.participants || this.stats.participants.total === 0) { return 0 }
      return this.stats.participants.finished / this.stats.participants.total * 100
    },
    sparkline () {
      return {
        value: this.stats.trend?.values || [],
        labels: this.stats.trend?.labels || [],
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
    },
    overview () {
      const {
        total = 0,
        pending = 0,
        in_progress: inProgress = 0,
        finished = 0
      } = (this.stats?.participants || {})
      return [
        {
          label: `${this.$t('stats.participants.total')}: `,
          value: total,
          classes: 'font-weight-bold'
        }, {
          label: `- ${this.$t('stats.participants.finished')}: `,
          value: finished
        }, {
          label: `- ${this.$t('stats.participants.in_progress')}: `,
          value: inProgress
        }, {
          label: `- ${this.$t('stats.participants.pending')}: `,
          value: pending
        }
      ]
    }
  },
  watch: {
    study (val, oldVal) {
      if (!val || val.id === oldVal?.id) {
        return
      }
      this.fetchStats()
    }
  },
  async mounted () {
    await this.fetchStats()
  },
  methods: {
    async fetchStats () {
      if (!this.study?.id) { return }
      this.loading.stats = true
      try {
        this.stats = await this.study.fetchParticipationStats()
        console.log(JSON.stringify(this.stats))
      } catch (e) {
        processErrors(e, this.notify)
      } finally {
        this.loading.stats = false
      }
    },
    refresh () {
      this.fetchStats()
    }
  }
}
</script>
