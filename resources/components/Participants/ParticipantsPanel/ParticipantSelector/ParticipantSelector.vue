<template>
  <v-card outlined>
    <v-virtual-scroll
      v-if="ptcps.length"
      :items="ptcps"
      :item-height="65"
      max-height="calc(100vh - 575px)"
      class="v-list"
    >
      <template v-slot="{ item }">
        <v-list-item
          :value="item.id"
          :class="{'blue lighten-5': item.selected}"
          @click="selectionChange(item.id, !item.selected )"
        >
          <v-list-item-action>
            <v-checkbox
              :input-value="item.selected"
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
    <v-card-text v-else>
      No participants to show
    </v-card-text>
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
  },
  computed: {
    ptcps () {
      return this.participants.map((ptcp) => {
        ptcp.selected = this.selected.includes(ptcp.id)
        return ptcp
      })
    }
  },
  methods: {
    selectionChange (id, checked) {
      if (checked) {
        this.selected.push(id)
      } else {
        this.selected.splice(this.selected.indexOf(id), 1)
      }
    }
  }

}
</script>
