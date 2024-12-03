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

    <v-list v-if="loading" key="loading" three-line class="py-0">
      <v-skeleton-loader
        :loading="loading"
        type="list-item-three-line@8"
      />
    </v-list>
    <v-list
      v-else
      key="loaded"
      max-height="66vh"
      class="py-0 overflow-y-auto"
    >
      <draggable
        v-model="rows"
        tag="v-list"
        handle=".sortHandle"
        @start="drag = true"
        @end="drag = false"
      >
        <v-list-item
          v-for="(study, i) in rows"
          :key="i"
          :to="localePath(`/dashboard/studies/${study.id}`)"
          nuxt
        >
          <v-btn v-if="showSortHandle" icon class="sortHandle">
            <v-icon>mdi-drag-horizontal-variant</v-icon>
          </v-btn>
          <v-list-item-content class="px-3">
            <v-list-item-title v-text="study.name" />
            <v-list-item-subtitle v-text="study.description" />
          </v-list-item-content>
          <v-fab-transition>
            <v-list-item-action v-show="!userIsOwner(study.id)" class="align-self-center">
              <v-tooltip bottom>
                <template #activator="{on, attrs}">
                  <v-icon color="primary" v-bind="attrs" v-on="on">
                    mdi-share-variant
                  </v-icon>
                </template>
                {{ $t('studies.list.shared_by') }} {{
                  studyOwners[study.id] && studyOwners[study.id].name
                }}
              </v-tooltip>
            </v-list-item-action>
          </v-fab-transition>
        </v-list-item>
        <v-divider />
      </draggable>
    </v-list>
  </div>
</template>

<script>
import draggable from 'vuedraggable'

export default {
  components: {
    draggable
  },
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
    },
    active: {
      type: Boolean,
      default: true
    },
    filter: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      drag: false
    }
  },
  computed: {
    studyOwners () {
      return this.studies.reduce((result, study) => {
        result[study.id] = study?.users.find(user => user.pivot.is_owner)
        return result
      }, {})
    },
    showSortHandle () {
      return this.active && !this.filter
    },
    rows: {
      get () {
        if (this.loading || !this.studies) { return [] }
        return this.studies
      },
      set (newOrder) {
        this.$emit('update:order', newOrder)
      }
    }
  },
  methods: {
    userIsOwner (studyID) {
      if (!this.studyOwners[studyID]) { return true }
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
