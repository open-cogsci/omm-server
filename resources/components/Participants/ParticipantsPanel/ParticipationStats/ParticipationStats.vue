<template>
  <v-row>
    <v-col cols="12" sm="6" lg="12" xl="5" class="text-center">
      <p class="text-subtitle-2">
        Study progress
      </p>
      <v-progress-circular
        rotate="-90"
        size="150"
        :value="studyProgress"
        color="green"
        width="20"
      >
        <div>
          <div class="text-h4">
            {{ studyProgress }}<span class="caption">%</span>
          </div>
          <div class="caption">
            Complete
          </div>
        </div>
      </v-progress-circular>
    </v-col>
    <v-col
      cols="12"
      sm="6"
      lg="12"
      xl="7"
      class="text-center text-sm-left text-md-center text-xl-left"
    >
      <p class="text-subtitle-2">
        Participation trend
      </p>
      <v-sparkline
        :value="value"
        :gradient="gradient"
        :smooth="radius || false"
        :padding="padding"
        :line-width="width"
        :stroke-linecap="lineCap"
        :gradient-direction="gradientDirection"
        :fill="fill"
        :type="type"
        :auto-line-width="autoLineWidth"
        auto-draw
      />
    </v-col>

    <v-col cols="12" sm="6" md="12" xl="7">
      <pre>
        - % Study complete
        - No. of participants
        - Last participation
        - Participations the last 7 days
      </pre>
    </v-col>
  </v-row>
</template>

<script>
const gradients = [
  ['#222'],
  ['#42b3f4'],
  ['red', 'orange', 'yellow'],
  ['purple', 'violet'],
  ['#00c6ff', '#F0F', '#FF0'],
  ['#f72047', '#ffd200', '#1feaea']
]

export default {
  props: {
    data: {
      type: Object,
      default: () => ({})
    }
  },
  data: () => ({
    width: 2,
    radius: 10,
    padding: 8,
    lineCap: 'round',
    gradient: gradients[5],
    value: [0, 2, 5, 9, 5, 10, 3, 5, 0, 0, 1, 8, 2, 9, 0],
    gradientDirection: 'top',
    gradients,
    fill: false,
    type: 'trend',
    autoLineWidth: false
  }),
  computed: {
    studyProgress () {
      if (!this.data.progress || this.data.progress.total === 0) { return 0 }
      return this.data.progress.finished / this.data.progress.total * 100
    }
  }
}
</script>
