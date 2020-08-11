<template>
  <v-dialog
    :value="value"
    max-width="600px"
    @input="$emit('input', $event)"
  >
    <v-card>
      <v-card-title>
        Collaborators
      </v-card-title>
      <v-card-text class="body-1 font-weight-light">
        Share this experiment with other users
      </v-card-text>
      <v-card-text v-if="collaborators.length === 0">
        There are no collaborators for this experiment.
      </v-card-text>
      <v-card-text v-else>
        <v-list>
          <v-list-item v-for="user of collaborators" :key="user.id">
            <v-list-item-content>
              <v-row no-gutters align="center">
                <v-col cols="8" md="9">
                  <v-list-item-title>
                    {{ user.name }}
                  </v-list-item-title>
                </v-col>
                <v-col cols="4" md="3">
                  <v-select
                    v-model="user.pivot.access_permission_id"
                    dense
                    :items="accessLevels"
                    hide-details
                  />
                </v-col>
              </v-row>
            </v-list-item-content>
            <v-list-item-action>
              <v-btn icon>
                <v-icon>mdi-delete</v-icon>
              </v-btn>
            </v-list-item-action>
          </v-list-item>
        </v-list>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn
          text
          @click="cancel"
        >
          <v-icon left>
            mdi-cancel
          </v-icon> Cancel
        </v-btn>
        <v-btn
          text
          color="success"
          :disabled="!formValid"
          :loading="saving"
          @click="save"
        >
          <v-icon left>
            mdi-check
          </v-icon>
          Save
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  props: {
    value: {
      type: Boolean,
      default: false
    },
    saving: {
      type: Boolean,
      default: false
    },
    formValid: {
      type: Boolean,
      default: true
    },
    users: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    collaborators () {
      return this.users?.filter(user => user.id !== this.$auth.user.id)
    },
    accessLevels () {
      return [
        { value: 1, text: this.$vuetify.breakpoint.smAndUp ? 'Can read' : 'Read' },
        { value: 2, text: this.$vuetify.breakpoint.smAndUp ? 'Can edit' : 'Edit' }
      ]
    }
  },
  methods: {
    cancel () {
      this.$emit('input', false)
    },
    save () {

    }
  }
}
</script>
