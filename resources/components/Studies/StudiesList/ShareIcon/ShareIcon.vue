<template>
  <v-fab-transition>
    <v-list-item-action v-show="!userIsOwner" class="align-self-center">
      <v-tooltip bottom>
        <template #activator="{on, attrs}">
          <v-icon color="primary" v-bind="attrs" v-on="on">
            mdi-share-variant
          </v-icon>
        </template>
        {{ $t('studies.list.shared_by') }} {{ owner.name }}
      </v-tooltip>
    </v-list-item-action>
  </v-fab-transition>
</template>

<script>
export default {
  props: {
    owner: {
      type: Object,
      required: true
    }
  },
  computed: {
    userIsOwner () {
      console.log('owner ID', this.owner?.id)
      console.log('user ID', this.$auth.user.id)
      return this.$auth.user.id === this.owner?.id
    }
  }
}
</script>
