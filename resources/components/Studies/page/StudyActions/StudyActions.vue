<template>
  <v-skeleton-loader
    :loading="loading"
    type="actions"
  >
    <v-item-group class="v-btn-toggle" :class="{'pr-5': $vuetify.breakpoint.mdAndUp}">
      <v-btn
        :color="osexpPresent?'default':'success'"
        @click="$emit('clicked-upload-exp')"
      >
        <v-icon left :color="osexpPresent?'black':'white'">
          mdi-upload
        </v-icon>
        experiment
      </v-btn>
      <v-btn
        :color="jobsPresent?'default':'success'"
        @click="$emit('clicked-upload-jobs')"
      >
        <v-icon left :color="jobsPresent?'black':'white'">
          mdi-upload
        </v-icon>
        jobs
      </v-btn>
    </v-item-group>

    <v-item-group class="v-btn-toggle" :class="{'pr-5': $vuetify.breakpoint.mdAndUp}">
      <v-btn
        @click="$emit('clicked-collaborators')"
      >
        <v-icon left>
          mdi-account
        </v-icon>
        Sharing
      </v-btn>
    </v-item-group>

    <v-item-group class="v-btn-toggle">
      <confirmation-dialog
        v-model="archiveDialog"
        @clicked-no="archiveDialog = false"
        @clicked-yes="$emit('clicked-archive'); archiveDialog = false"
      >
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            v-bind="attrs"
            v-on="on"
          >
            <v-icon left>
              {{ study.active ? 'mdi-archive' : 'mdi-archive-arrow-up' }}
            </v-icon>
            {{ study.active ? 'Archive' : 'Reactivate' }}
          </v-btn>
        </template>
        <template v-slot:title>
          <span v-if="study.active">are about to archive this study</span>
          <span v-else>You are about to reactivate this study</span>
        </template>
        <div v-if="study.active">
          <p>
            After you have archived this study, it is no longer is available for participants.
            Any reports about the study will also be removed from your dashboard.
          </p>
          <p>Are you sure you want to archive this study?</p>
        </div>
        <div v-else>
          <p>
            After you have reactivated this study, it will be discoverable for participants again.
            Any reports about the study will added to your dashboard.
          </p>
          <p>Are you sure you want to reactivate this study?</p>
        </div>
      </confirmation-dialog>

      <confirmation-dialog
        v-model="deleteDialog"
        @clicked-no="deleteDialog = false"
        @clicked-yes="$emit('clicked-delete')"
      >
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            :disabled="disableDelete"
            v-bind="attrs"
            v-on="on"
          >
            <v-icon left>
              mdi-delete
            </v-icon>
            Delete
          </v-btn>
        </template>
        <template v-slot:title>
          You are about to <span class="error--text">&nbsp;delete&nbsp;</span> this study
        </template>
        <p><strong>Deleting this study will also erase all its participations and associated data entries.</strong></p>
        <p>
          Are you sure you want to do this?
        </p>
      </confirmation-dialog>
    </v-item-group>
  </v-skeleton-loader>
</template>

<script>
export default {
  components: {
    ConfirmationDialog: () => import('@/components/common/ConfirmationDialog')
  },
  props: {
    study: {
      type: Object,
      default: () => ({})
    },
    loading: {
      type: Boolean,
      default: false
    },
    disableDelete: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      deleteDialog: false,
      archiveDialog: false
    }
  },
  computed: {
    osexpPresent () {
      // eslint-disable-next-line camelcase
      return !!this.study?.osexp_path
    },
    jobsPresent () {
      return !!this.study?.jobs?.length
    }
  }
}
</script>
