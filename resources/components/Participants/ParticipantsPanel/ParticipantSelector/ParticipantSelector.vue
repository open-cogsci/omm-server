<template>
  <v-skeleton-loader
    :loading="loading"
    type="list-item-two-line@5"
  >
    <v-virtual-scroll
      v-if="participants.length"
      :items="participants"
      :item-height="65"
      max-height="calc(100vh - 490px)"
    >
      <template v-slot="{ item }">
        <v-list-item>
          <v-list-item-content>
            <v-list-item-title v-text="item.name" />
            <v-list-item-subtitle v-text="item.identifier" />
          </v-list-item-content>
        </v-list-item>
        <v-divider />
      </template>
    </v-virtual-scroll>
    <h3 v-else class="px-4 font-weight-light">
      No participants to show
    </h3>
  </v-skeleton-loader>
</template>

<script>
export default {
  props: {
    participants: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    }
  }
}
</script>
