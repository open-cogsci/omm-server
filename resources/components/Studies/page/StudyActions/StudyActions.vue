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
              mdi-archive
            </v-icon>
            Archive
          </v-btn>
        </template>
        <template v-slot:title>
          You are about to archive this study
        </template>
        <p>
          After you have archived this study, it is no longer is available for participants.
          Any reports about the study will also be removed from your dashboard.
        </p>
        <p>Are you sure you want to archive this study?</p>
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
  },
  data () {
    return {
      deleteDialog: false,
      archiveDialog: false
    }
  }
}
</script>
