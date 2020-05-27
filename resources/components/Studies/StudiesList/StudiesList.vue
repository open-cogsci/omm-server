<template>
  <div>
    <v-list v-if="addStudyButton" class="py-0">
      <v-list-item
        class="success"
        dark
        @click="$emit('clicked-new-study')"
      >
        <v-list-item-icon>
          <v-icon>mdi-plus</v-icon>
        </v-list-item-icon>
        <v-list-item-content>
          <v-list-item-title>Add a new study</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </v-list>

    <transition name="fade" mode="out-in">
      <v-list v-if="loading" key="loading" three-line class="py-0">
        <template v-for="i in 7">
          <v-skeleton-loader
            :key="i"
            :loading="loading"
            type="list-item-three-line"
          />
          <v-divider :key="`divider-${i}`" />
        </template>
      </v-list>
      <v-list v-else key="loaded" three-line class="py-0 fill-space">
        <template v-for="study in studies">
          <v-list-item :key="study.id" :to="`/dashboard/studies/${study.id}`" nuxt>
            <v-list-item-content class="px-3">
              <v-list-item-title v-text="study.name" />
              <v-list-item-subtitle v-text="study.description" />
            </v-list-item-content>
          </v-list-item>
          <v-divider :key="`divider-${study.id}`" />
        </template>
      </v-list>
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
