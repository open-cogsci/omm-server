<template>
  <div class="fill-height d-flex flex-column">
    <v-card-text class="fill-height">
      <v-row
        v-for="(value, field) in listable(participant)"
        :key="field"
        :dense="!!participant.meta"
        class="body-1"
      >
        <v-col cols="6" md="4" class="font-weight-medium">
          {{ label(field) }}:
        </v-col>
        <v-col cols="6" md="8">
          {{ convertBools(value) }}
        </v-col>
      </v-row>
    </v-card-text>
    <v-card-actions v-if="$auth.user.user_type_id === 1">
      <v-spacer />
      <v-tooltip v-if="participant.studies_count > 0" bottom>
        <template v-slot:activator="{ on, attrs }">
          <div
            v-bind="attrs"
            v-on="on"
          >
            <v-btn
              text
              color="error"
              disabled
            >
              <v-icon left>
                mdi-delete
              </v-icon>
              <span v-text="$t('common.delete')" />
            </v-btn>
          </div>
        </template>
        <!-- eslint-disable-next-line vue/no-v-html -->
        <span v-html="$t('participants.tooltips.delete')" />
      </v-tooltip>
      <v-btn
        v-else
        text
        color="error"
        @click="$emit('clicked-delete', participant.id)"
      >
        <v-icon left>
          mdi-delete
        </v-icon>
        <span v-text="$t('common.delete')" />
      </v-btn>

      <v-btn text color="primary" @click="$emit('clicked-edit', participant.id)">
        <v-icon left>
          mdi-pencil
        </v-icon>
        <span v-text="$t('common.edit')" />
      </v-btn>
    </v-card-actions>
  </div>
</template>

<script>
import { pick } from 'lodash'

export default {
  props: {
    participant: {
      type: Object,
      required: true
    }
  },
  methods: {
    listable: ptcp => pick(ptcp, ['name', 'identifier', 'meta', 'active', 'created_at', 'updated_at']),
    label (val) {
      return this.$t(`participants.${val}`)
    },
    convertBools (val) {
      if (typeof val !== 'boolean') { return val }
      return val
        ? this.$t('common.yes')
        : this.$t('common.no')
    }
  }
}
</script>
