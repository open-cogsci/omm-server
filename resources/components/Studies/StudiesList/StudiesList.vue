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
        <template #default="{ item }">
          <v-list-item three-line :to="localePath(`/dashboard/studies/${item.id}`)" nuxt>
            <v-list-item-content class="px-3">
              <v-list-item-title v-text="item.name" />
              <v-list-item-subtitle v-text="item.description" />
            </v-list-item-content>
            <share-icon
              :owner="studyOwner(item.id)"
            />
          </v-list-item>
          <v-divider />
        </template>
      </v-virtual-scroll>
    </transition>
  </div>
</template>

<script>
import ShareIcon from './ShareIcon/ShareIcon.vue'
export default {
  components: { ShareIcon },
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
    StudyUser () {
      return this.$store.$db().model('study_user')
    },
    User () {
      return this.$store.$db().model('users')
    }
  },
  methods: {
    studyOwner (studyID) {
      const record = this.StudyUser.query()
        .where('study_id', studyID)
        .where('is_owner', true)
        .first()
      if (!record) {
        return {}
      }
      const ownerID = record.user_id
      return this.User.find(ownerID) || {}
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
