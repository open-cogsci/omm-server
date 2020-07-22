<template>
  <fragment>
    <v-tooltip
      bottom
      color="success"
    >
      <template v-slot:activator="{ on }">
        <v-icon
          :disabled="saveDisabled"
          color="success"
          v-on="on"
          @click="$emit('clicked-save')"
        >
          mdi-check
        </v-icon>
      </template>
      Save changes
    </v-tooltip>
                  &nbsp;
    <v-tooltip bottom>
      <template v-slot:activator="{ on }">
        <v-icon
          v-on="on"
          @click="$emit('clicked-cancel')"
        >
          mdi-cancel
        </v-icon>
      </template>
      Discard changes
    </v-tooltip>
  </fragment>
</template>

<script>
export default {
  props: {
    saveDisabled: { type: Boolean, default: false }
  }
}
</script>
