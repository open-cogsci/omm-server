<template>
  <fragment>
    <v-skeleton-loader
      :loading="loading"
      type="actions"
    >
      <v-item-group class="v-btn-toggle" :class="{'pr-5': $vuetify.breakpoint.mdAndUp}">
        <v-btn
          :color="osexpPresent?'default':'success'"
          @click="$emit('clicked-upload')"
        >
          <v-icon left :color="osexpPresent?'black':'white'">
            mdi-upload
          </v-icon>
          <span class="d-none d-lg-inline">Upload&nbsp;</span>experiment
        </v-btn>
        <v-btn
          :color="jobsPresent?'default':'success'"
          @click="$emit('clicked-upload')"
        >
          <v-icon left :color="jobsPresent?'black':'white'">
            mdi-upload
          </v-icon>
          <span class="d-none d-lg-inline">Upload&nbsp;</span>jobs
        </v-btn>
      </v-item-group>

      <v-item-group class="v-btn-toggle" :class="{'pr-5': $vuetify.breakpoint.mdAndUp}">
        <v-btn
          @click="$emit('clicked-collaborators')"
        >
          <v-icon left>
            mdi-account
          </v-icon>
          Collaborators
        </v-btn>
      </v-item-group>

      <v-item-group class="v-btn-toggle">
        <v-btn
          @click="$emit('clicked-archive')"
        >
          <v-icon left>
            mdi-archive
          </v-icon>
          Archive
        </v-btn>
        <v-btn
          :disabled="disableDelete"
          @click="$emit('clicked-delete')"
        >
          <v-icon left>
            mdi-delete
          </v-icon>
          Delete
        </v-btn>
      </v-item-group>
    </v-skeleton-loader>
  </fragment>
</template>

<script>
export default {
  props: {
    loading: {
      type: Boolean,
      default: false
    },
    disableDelete: {
      type: Boolean,
      default: false
    },
    osexpPresent: {
      type: Boolean,
      default: false
    },
    jobsPresent: {
      type: Boolean,
      default: false
    }
  }
}
</script>
