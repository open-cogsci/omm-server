<template>
  <v-card outlined>
    <v-virtual-scroll
      v-if="ptcps.length"
      :items="ptcps"
      :item-height="65"
      :height="scrollHeight"
      @scroll.native="scrolling"
    >
      <template #default="{ item }">
        <v-list-item
          :key="item.id + '-' + item.selected"
          :value="item.id"
          :class="{ 'blue lighten-5': item.selected }"
          @click="selectionChange(item.id, !item.selected)"
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
  data () {
    const viewportHeight =
      typeof window !== 'undefined'
        ? window.innerHeight
        : 975

    return {
      scrollHeight: Math.min(
        400,
        Math.max(200, viewportHeight - 575)
      )
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
    this.updateHeight = debounce(this.updateHeight, 100)
  },

  mounted () {
    window.addEventListener('resize', this.updateHeight)
  },
  beforeDestroy () {
    window.removeEventListener('resize', this.updateHeight)

    if (this.scrolling.cancel) {
      this.scrolling.cancel()
    }

    if (this.updateHeight.cancel) {
      this.updateHeight.cancel()
    }
  },

  methods: {
    updateHeight () {
      const availableHeight = window.innerHeight - 575

      this.scrollHeight = Math.min(
        400,
        Math.max(200, availableHeight)
      )
    },
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

      if (!element) {
        return
      }

      const remainingScroll =
        element.scrollHeight -
        element.scrollTop -
        element.clientHeight

      if (remainingScroll <= 4) {
        this.$emit('scroll-end')
      }
    }
  }
}
</script>
