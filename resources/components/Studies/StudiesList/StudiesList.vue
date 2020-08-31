<template>
  <div>
    <v-list v-if="addStudyButton" class="py-0">
      <v-list-item
        class="success pl-6"
        dark
        @click="$emit('clicked-new-study')"
      >
        <v-list-item-icon>
          <v-icon>mdi-plus</v-icon>
        </v-list-item-icon>
        <v-list-item-content>
          <v-list-item-title v-text="$t('studies.list.add')" />
        </v-list-item-content>
      </v-list-item>
    </v-list>

    <transition name="fade" mode="out-in">
      <v-list v-if="loading" key="loading" three-line class="py-0">
        <v-skeleton-loader
          :loading="loading"
          type="list-item-three-line@8"
        />
      </v-list>
      <v-virtual-scroll
        v-else
        key="loaded"
        :items="studies"
        :item-height="88"
        height="calc(100vh - 268px)"
        class="py-0"
      >
        <template v-slot="{ item }">
          <v-list-item three-line :to="localePath(`/dashboard/studies/${item.id}`)" nuxt>
            <v-list-item-content class="px-3">
              <v-list-item-title v-text="item.name" />
              <v-list-item-subtitle v-text="item.description" />
            </v-list-item-content>
            <v-list-item-action v-if="!userIsOwner(item.id)" class="align-self-center">
              <v-tooltip bottom>
                <template v-slot:activator="{on, attrs}">
                  <v-icon color="primary" v-bind="attrs" v-on="on">
                    mdi-share-variant
                  </v-icon>
                </template>
                {{ $t('studies.list.shared_by') }} {{ studyOwners[item.id].name }}
              </v-tooltip>
            </v-list-item-action>
          </v-list-item>
          <v-divider />
        </template>
      </v-virtual-scroll>
    </transition>
  </div>
</template>

<script>
export default {
  props: {
    studies: {
      type: Array,
      required: true
    },
    loading: {
      type: Boolean,
      default: false
    },
    addStudyButton: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    studyOwners () {
      return this.studies.reduce((result, study) => {
        result[study.id] = study?.users.find(user => user.pivot.is_owner)
        return result
      }, {})
    }
  },
  methods: {
    userIsOwner (studyID) {
      return this.$auth.user.id === this.studyOwners[studyID].id
    }
  }
}
</script>

<style lang="scss" scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity .2s;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}
.fill-space {
  height: calc(100vh - 268px);
  overflow: auto;
}
</style>
