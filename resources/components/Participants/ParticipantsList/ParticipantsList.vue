<template>
  <v-expansion-panels accordion>
    <v-expansion-panel v-for="(ptcp, i) in participants" :key="i">
      <v-expansion-panel-header v-slot="{ open }">
        <v-row no-gutters>
          <v-col cols="4">
            <v-fade-transition leave-absolute>
              <span :class="{'font-weight-bold': open}">
                {{ ptcp.name }}
              </span>
            </v-fade-transition>
          </v-col>
          <v-col
            cols="8"
            class="text--secondary"
          >
            <v-fade-transition leave-absolute>
              <v-row
                v-if="!open"
                no-gutters
                style="width: 100%"
              >
                <v-col cols="6">
                  <v-icon small>
                    mdi-tag
                  </v-icon> {{ ptcp.rfid }}
                </v-col>
              </v-row>
            </v-fade-transition>
          </v-col>
        </v-row>
      </v-expansion-panel-header>
      <v-expansion-panel-content>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit,
        sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
        Ut enim ad minim veniam, quis nostrud exercitation ullamco
        laboris nisi ut aliquip ex ea commodo consequat.
      </v-expansion-panel-content>
    </v-expansion-panel>
  </v-expansion-panels>
</template>

<script>
export default {
  props: {
    participants: {
      type: Array,
      default: () => []
    }
  },
  data () {
    return {
      panel: [0]
    }
  }
}
</script>
