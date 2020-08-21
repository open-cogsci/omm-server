<template>
  <v-card outlined>
    <v-list-item-group
      v-model="selected"
      multiple
    >
      <v-virtual-scroll
        :items="participants"
        :item-height="65"
        max-height="calc(100vh - 575px)"
      >
        <template v-slot="{ item }">
          <v-list-item :key="item.id" :value="item.id">
            <v-list-item-action>
              <v-checkbox
                :input-value="selected.includes(item.id)"
                color="primary"
              />
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title>
                {{ item.name }}
              </v-list-item-title>
              <v-list-item-subtitle>
                {{ item.identifier }}
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
        </template>
      </v-virtual-scroll>
    </v-list-item-group>
  </v-card>
</template>

<script>
export default {
  sync: ['selected'],
  props: {
    participants: {
      type: Array,
      required: true
    }
  }

}
</script>
