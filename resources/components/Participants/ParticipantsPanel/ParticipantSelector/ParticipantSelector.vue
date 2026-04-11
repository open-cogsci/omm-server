<template>
  <smooth-reflow>
    <v-card outlined>
      <v-virtual-scroll
        v-if="ptcps.length"
        :items="ptcps"
        :item-height="65"
        max-height="calc(100vh - 575px)"
        @scroll.native="scrolling"
      >
        <template #default="{ item }">
          <v-list-item
            :key="item.id + '-' + item.selected"
            :value="item.id"
            :class="{'blue lighten-5': item.selected}"
            @click="selectionChange(item.id, !item.selected )"
          >
            <v-list-item-action>
              <v-checkbox
                :input-value="item.selected"
                @click.stop="selectionChange(item.id, !item.selected)"
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
  </smooth-reflow>
</template>

<script>
import { debounce } from 'lodash'
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
      const selected = this.selected
      return this.participants.map((ptcp) => {
        return {
          ...ptcp,
          selected: selected.includes(ptcp.id)
        }
      })
    }
  },
  created () {
    this.scrolling = debounce(this.scrolling, 200)
  },
  methods: {
    selectionChange (id, checked) {
      let next

      if (checked) {
        next = [...this.selected, id]
      } else {
        next = this.selected.filter(i => i !== id)
      }

      this.$emit('update:selected', next)
    },
    scrolling (event) {
      const element = event.currentTarget || event.target
      if (element && element.scrollHeight - element.scrollTop === element.clientHeight) {
        this.$emit('scroll-end')
      }
    }
  }

}
</script>
