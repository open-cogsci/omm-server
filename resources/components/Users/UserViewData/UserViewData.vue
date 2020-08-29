<template>
  <div class="fill-height d-flex flex-column">
    <v-card-text class="fill-height">
      <v-row
        v-for="(value, field) in listable(user)"
        :key="field"
        dense
        class="body-1"
      >
        <v-col cols="5" md="4" class="font-weight-medium">
          {{ label(field) }}:
        </v-col>
        <v-col cols="7" md="8" class="text-truncate">
          {{ convertIfNecessary(value, field) }}
        </v-col>
      </v-row>
    </v-card-text>
    <v-card-actions>
      <v-spacer />
      <v-tooltip v-if="user.studies_count > 0 || user.id === $auth.user.id" bottom>
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
              </v-icon>{{ $t('common.delete') }}
            </v-btn>
          </div>
        </template>
        <!--  eslint-disable-next-line vue/no-v-html -->
        <span v-html="$t('users.prevent_delete')" />
      </v-tooltip>
      <v-btn
        v-else
        text
        color="error"
        @click="$emit('clicked-delete', user.id)"
      >
        <v-icon left>
          mdi-delete
        </v-icon>{{ $t('common.delete') }}
      </v-btn>

      <v-btn text color="primary" @click="$emit('clicked-edit', user.id)">
        <v-icon left>
          mdi-pencil
        </v-icon>{{ $t('common.edit') }}
      </v-btn>
    </v-card-actions>
  </div>
</template>

<script>
import { pick, isObject } from 'lodash'
import { isValid, parseJSON, formatRelative } from 'date-fns'

export default {
  props: {
    user: {
      type: Object,
      required: true
    }
  },
  methods: {
    listable: ptcp => pick(ptcp,
      ['name', 'email', 'user_type', 'account_status', 'last_login', 'created_at', 'updated_at']),
    label (val) {
      return this.$t(`users.labels.${val}`)
    },
    convertIfNecessary (val, field) {
      if (typeof val === 'boolean') {
        return val ? this.$t('common.yes') : this.$t('common.no')
      }
      if (isObject(val)) {
        return val.name
      }
      if (field === 'account_status') {
        return this.$t(`users.status.${val}`)
      }
      if (field === 'last_login') {
        if (!val) { return this.$t('common.never') }
        const parsed = parseJSON(val)
        if (isValid(parsed)) {
          return formatRelative(parsed, Date.now())
        }
      }
      return val
    }
  }
}
</script>
