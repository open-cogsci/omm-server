<template>
  <v-dialog
    persistent
    :value="value"
    max-width="750px"
    @input="$emit('input', $event)"
  >
    <v-card>
      <v-card-title>Manage participants</v-card-title>
      <v-card-text class="body-1 font-weight-light">
        Assign participants to this study
      </v-card-text>
      <v-card-text>
        <v-virtual-scroll
          v-card-text
          <
        >
          <v-card-actions>
            <v-spacer />
            <v-btn text @click="$emit('input', false)">
              Close
            </v-btn>
          </v-card-actions>
        </v-virtual-scroll>
      </v-card-text></v-virtual-scroll>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  props: {
    value: {
      type: Boolean,
      default: false
    }
  }
}
</script>
