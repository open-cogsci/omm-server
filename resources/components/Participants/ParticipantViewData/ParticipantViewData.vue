<template>
  <div>
    <v-card-text class="pt-5">
      <v-row
        v-for="(value, field) in listable(participant)"
        :key="field"
        :dense="$vuetify.breakpoint.xsOnly"
        class="body-1"
      >
        <v-col cols="6" md="4" class="font-weight-medium">
          {{ field | label }}:
        </v-col>
        <v-col cols="6" md="8">
          {{ value }}
        </v-col>
      </v-row>
    </v-card-text>
    <v-card-actions>
      <v-spacer />
      <v-btn text color="primary" @click="$emit('clicked-edit', participant.id)">
        <v-icon left>
          mdi-pencil
        </v-icon> Edit
      </v-btn>
    </v-card-actions>
  </div>
</template>

<script>
import { upperFirst, upperCase, lowerCase, pick } from 'lodash'

export default {
  filters: {
    label: (val) => {
      if (val === 'rfid') { return upperCase(val) }
      return upperFirst(lowerCase(val))
    }
  },
  props: {
    participant: {
      type: Object,
      required: true
    }
  },
  methods: {
    listable: ptcp => pick(ptcp, ['name', 'rfid', 'active', 'created_at', 'updated_at'])
  }
}
</script>
