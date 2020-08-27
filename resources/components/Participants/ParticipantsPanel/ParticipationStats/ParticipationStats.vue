<template>
  <v-row>
    <v-col cols="12" sm="6">
      <p class="text-subtitle-2 secondary--text">
        Overview
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
    <v-col cols="12" sm="6" class="text-center">
      <p class="text-subtitle-2 secondary--text text-left text-sm-center">
        Study progress
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
            {{ studyProgress }}<span class="caption">%</span>
          </div>
          <div class="caption">
            Complete
          </div>
        </div>
      </v-progress-circular>
    </v-col>

    <v-col cols="12">
      <p class="text-subtitle-2 secondary--text">
        Participation trend
      </p>
      <v-sparkline
        v-bind="sparkline"
        type="trend"
        auto-draw
      />
    </v-col>
  </v-row>
</template>

<script>
export default {
  props: {
    data: {
      type: Object,
      default: () => ({})
    }
  },
  data () {
    return {
      labelColSizes: { cols: 6, sm: 7, lg: 8, xl: 6 },
      valueColSizes: { cols: 6, sm: 5, lg: 4, xl: 6 }
    }
  },
  computed: {
    studyProgress () {
      if (!this.data.participants || this.data.participants.total === 0) { return 0 }
      return this.data.participants.finished / this.data.participants.total * 100
    },
    sparkline () {
      return {
        value: this.data.trend?.values || [],
        labels: this.data.trend?.labels || [],
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
      } = (this.data?.participants || {})
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
  }
}
</script>
