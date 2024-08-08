<template>
  <!-- eslint-disable vue/no-v-html  -->
  <v-skeleton-loader
    :loading="loading"
    type="actions"
  >
    <v-item-group v-if="userCanEdit" class="v-btn-toggle" :class="{'pr-5': $vuetify.breakpoint.mdAndUp}">
      <v-btn
        :color="osexpPresent?'default':'success'"
        @click="$emit('clicked-upload-exp')"
      >
        <v-icon left :color="osexpPresent?'black':'white'">
          mdi-upload
        </v-icon>
        {{ $t('studies.actions.upload_experiment') }}
      </v-btn>
      <v-btn
        :color="jobsPresent?'default':'success'"
        @click="$emit('clicked-upload-jobs')"
      >
        <v-icon left :color="jobsPresent?'black':'white'">
          mdi-upload
        </v-icon>
        {{ $t('studies.actions.upload_jobs') }}
      </v-btn>
    </v-item-group>

    <v-item-group v-if="userIsOwner" class="v-btn-toggle" :class="{'pr-5': $vuetify.breakpoint.mdAndUp}">
      <v-btn
        @click="$emit('clicked-download-result-data')"
      >
        <v-icon v-bind="shareIconAttrs">
          mdi-download
        </v-icon>
        <span class="d-none d-sm-inline">
          {{ $t('studies.actions.download_result_data') }}
        </span>
      </v-btn>
    </v-item-group>

    <v-item-group :class="{'v-btn-toggle': userCanEdit}">
      <confirmation-dialog
        v-if="userCanEdit"
        v-model="archiveDialog"
        @clicked-no="archiveDialog = false"
        @clicked-yes="$emit('clicked-archive'); archiveDialog = false"
      >
        <template #activator="{ on, attrs }">
          <v-btn
            v-bind="attrs"
            v-on="on"
          >
            <v-icon v-bind="delArchiveIconAttrs">
              {{ study && study.active ? 'mdi-archive' : 'mdi-archive-arrow-up' }}
            </v-icon>
            <span class="d-none d-sm-inline d-lg-none d-xl-inline">
              {{ study && study.active ? $t('studies.actions.archive') : $t('studies.actions.reactivate') }}
            </span>
          </v-btn>
        </template>
        <template #title>
          <span v-if="study && study.active" v-text="$t('studies.dialogs.confirmation.archive.title')" />
          <span v-else v-text="$t('studies.dialogs.confirmation.reactivate.title')" />
        </template>
        <div v-if="study && study.active" v-html="$t('studies.dialogs.confirmation.archive.body')" />
        <div v-else v-html="$t('studies.dialogs.confirmation.reactivate.body')" />
      </confirmation-dialog>

      <confirmation-dialog
        v-model="deleteDialog"
        @clicked-no="deleteDialog = false"
        @clicked-yes="$emit('clicked-delete')"
      >
        <template #activator="{ on, attrs }">
          <v-btn
            :disabled="disableDelete"
            v-bind="attrs"
            :large="!userCanEdit"
            v-on="on"
          >
            <v-icon v-bind="delArchiveIconAttrs">
              mdi-delete
            </v-icon>
            <span class="d-none d-sm-inline d-lg-none d-xl-inline">
              {{ $t('studies.actions.delete') }}
            </span>
          </v-btn>
        </template>
        <template #title>
          <span v-html="$t('studies.dialogs.confirmation.delete.title')" />
        </template>
        <div v-html="deleteBody" />
      </confirmation-dialog>
    </v-item-group>

    <v-item-group v-if="userIsOwner" class="v-btn-toggle" :class="{'pl-5': $vuetify.breakpoint.mdAndUp}">
      <v-btn
        @click="$emit('clicked-collaborators')"
      >
        <v-icon v-bind="shareIconAttrs">
          mdi-share-variant
        </v-icon>
        <span class="d-none d-sm-inline">
          {{ $t('studies.actions.sharing') }}
        </span>
      </v-btn>
    </v-item-group>

    <!-- Ugly hack to include v-btn-toggle class in final build -->
    <v-btn-toggle v-if="alwaysFalse" />
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
    jobs: {
      type: Array,
      default: () => ([])
    },
    userCanEdit: {
      type: Boolean,
      default: false
    },
    userIsOwner: {
      type: Boolean,
      default: false
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
      archiveDialog: false,
      alwaysFalse: false
    }
  },
  computed: {
    osexpPresent () {
      return !!this.study?.files.filter(item => item.type === 'experiment').length
    },
    jobsPresent () {
      return !!this.jobs?.length
    },
    shareIconAttrs () {
      return this.$vuetify.breakpoint.mdAndUp || this.$vuetify.breakpoint.smOnly
        ? { left: true }
        : { size: 18 }
    },
    delArchiveIconAttrs () {
      return this.$vuetify.breakpoint.xsOnly || this.$vuetify.breakpoint.lgOnly
        ? { size: 18 }
        : { left: true }
    },
    deleteBody () {
      return this.userIsOwner
        ? this.$t('studies.dialogs.confirmation.delete.body')
        : this.$t('studies.dialogs.confirmation.delete.body_collaborator')
    }
  }
}
</script>
