<template>
  <div>
    <v-card-text>
      <v-row
        v-for="(value, field) in listable(user)"
        :key="field"
        :dense="$vuetify.breakpoint.xsOnly"
        class="body-1"
      >
        <v-col cols="6" md="4" class="font-weight-medium">
          {{ field | label }}:
        </v-col>
        <v-col cols="6" md="8">
          {{ value | convertBools }}
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
              </v-icon> Delete<span class="d-none d-sm-flex d-md-none d-lg-flex">&nbsp;user</span>
            </v-btn>
          </div>
        </template>
        <span>A user can no longer be deleted when it is associated with a study.<br>
          Deactivate the user instead.</span>
      </v-tooltip>
      <v-btn
        v-else
        text
        color="error"
        @click="$emit('clicked-delete', user.id)"
      >
        <v-icon left>
          mdi-delete
        </v-icon> Delete<span class="d-none d-sm-flex d-md-none d-lg-flex">&nbsp;user</span>
      </v-btn>

      <v-btn text color="primary" @click="$emit('clicked-edit', user.id)">
        <v-icon left>
          mdi-pencil
        </v-icon> Edit<span class="d-none d-sm-flex d-md-none d-lg-flex">&nbsp;properties</span>
      </v-btn>
    </v-card-actions>
  </div>
</template>

<script>
import { upperFirst, lowerCase, pick } from 'lodash'

export default {
  filters: {
    label: val => upperFirst(lowerCase(val)),
    convertBools: (val) => {
      if (typeof val !== 'boolean') { return val }
      return val ? 'Yes' : 'No'
    }
  },
  props: {
    user: {
      type: Object,
      required: true
    }
  },
  methods: {
    listable: ptcp => pick(ptcp, ['name', 'email', 'user_type', 'active', 'created_at', 'updated_at'])
  }
}
</script>
