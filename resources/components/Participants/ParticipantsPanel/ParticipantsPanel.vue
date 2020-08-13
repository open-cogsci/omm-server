<template>
  <v-row>
    <v-col cols="12" sm="6" md="12" lg="6">
      <v-card outlined>
        <v-card-title>
          Stats
        </v-card-title>
        <v-card-text>
          <participation-stats />
        </v-card-text>
      </v-card>
    </v-col>
    <v-col cols="12" sm="6" md="12" lg="6">
      <v-card outlined>
        <v-card-title>
          Participants
        </v-card-title>
        <v-card-text class="px-0">
          <participant-selector
            :participants="participants"
            :loading="loading"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn v-if="participants.length" color="primary">
            <v-icon left>
              mdi-download
            </v-icon>
            Data
          </v-btn>
          <v-btn color="primary">
            <v-icon left>
              mdi-account-group
            </v-icon>
            Manage
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
export default {
  components: {
    ParticipationStats: () => import('./ParticipationStats'),
    ParticipantSelector: () => import('./ParticipantSelector')
  },
  props: {
    study: {
      type: Object,
      default: () => null
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    Participant () {
      return this.$store.$db().model('participants')
    },
    participants () {
      return this.study?.participants || []
    }
  }
}
</script>
