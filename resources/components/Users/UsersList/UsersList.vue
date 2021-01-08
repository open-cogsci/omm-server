<template>
  <v-expansion-panels v-model="panel" popout hover>
    <v-expansion-panel v-for="user in users" :key="user.id">
      <v-expansion-panel-header v-slot="{ open }">
        <v-row no-gutters>
          <v-col
            cols="12"
            sm="4"
            class="text-truncate text-body-2 text-md-body-1"
            :class="{'font-weight-bold': open}"
          >
            {{ user.name }}
          </v-col>
          <v-col
            sm="8"
            class="text--secondary hidden-xs-only"
          >
            <v-fade-transition leave>
              <v-row
                v-if="!open"
                no-gutters
                style="width: 100%"
                class="text-caption text-md-body-2"
              >
                <v-col cols="5">
                  {{ user.email }}
                </v-col>
                <v-col cols="3">
                  {{ $t(`users.types.${user.user_type.name}`) }}
                </v-col>
                <v-col cols="2">
                  <v-tooltip left>
                    <template #activator="{ on, attrs }">
                      <v-icon
                        small
                        v-bind="attrs"
                        v-on="on"
                      >
                        mdi-flask
                      </v-icon>
                    </template>
                    {{ $t('layout.nav.studies') }}
                  </v-tooltip>{{ user.studies_count }}
                </v-col>
                <v-col cols="2" class="text-center">
                  <span
                    class="font-weight-light"
                    :class="statusColor(user.account_status)"
                  >
                    {{ $t(`users.status.${user.account_status}`) }}
                  </span>
                </v-col>
              </v-row>
            </v-fade-transition>
          </v-col>
        </v-row>
      </v-expansion-panel-header>
      <v-expansion-panel-content>
        <v-row>
          <v-col cols="12" md="6">
            <v-card outlined class="d-flex flex-column" height="400">
              <v-card-title class="subtitle-1 blue-grey lighten-5">
                {{ $t('common.properties') }}
              </v-card-title>

              <v-fade-transition mode="out-in" class="mt-5">
                <user-edit-data
                  v-if="editing === user.id"
                  :user="user"
                  :saving="saving"
                  :resending="resending"
                  :errors="errors"
                  @clicked-cancel="editing = null"
                  @clicked-save="$emit('update-user', $event)"
                  @clicked-resend-email="$emit('resend-email', $event)"
                  @update:errors="$emit('update:errors', $event)"
                />
                <user-view-data
                  v-else
                  :user="user"
                  :deleting="deleting"
                  style="width: 100%"
                  @clicked-edit="(id) => editing = id"
                  @clicked-delete="$emit('delete-user', $event)"
                />
              </v-fade-transition>
            </v-card>
          </v-col>
          <v-col cols="12" md="6">
            <v-card outlined class="fill-height">
              <v-card-title class="subtitle-1 blue-grey lighten-5">
                {{ $t('layout.nav.studies') }}
              </v-card-title>
              <v-card-text class="pa-0">
                <v-skeleton-loader
                  :loading="loadingUser === user.id"
                  type="divided-list-item@5"
                  :types="{'divided-list-item': 'list-item-two-line, divider'}"
                >
                  <!-- With only a virtual scroll here, the skeleton loader never leaves the
                  loading state. Therefore there also is an empty div -->
                  <div />
                  <v-virtual-scroll
                    v-if="user.studies.length"
                    :items="user.studies.filter(study => study.pivot.is_owner)"
                    :item-height="65"
                    height="340"
                  >
                    <template #default="{ item }">
                      <v-list-item>
                        <v-list-item-content>
                          <v-list-item-title v-text="item.name" />
                          <v-list-item-subtitle v-text="item.description" />
                        </v-list-item-content>
                        <v-list-item-action>
                          <v-list-item-action-text class="info--text">
                            <div>
                              <v-tooltip bottom>
                                <template #activator="{on, attrs}">
                                  <div class="d-inline-block" v-bind="attrs" v-on="on">
                                    <span>{{ item.participants_count }}</span>
                                    <v-icon color="info">
                                      mdi-baby-face
                                    </v-icon>
                                  </div>
                                </template>
                                {{ $t('layout.nav.participants') }}
                              </v-tooltip>
                              <v-tooltip bottom>
                                <template #activator="{on, attrs}">
                                  <div class="d-inline-block" v-bind="attrs" v-on="on">
                                    <progress-circle :value="progress(item)" />
                                  </div>
                                </template>
                                {{ $t('stats.progress') }}
                              </v-tooltip>
                            </div>
                          </v-list-item-action-text>
                        </v-list-item-action>
                      </v-list-item>
                      <v-divider :key="`divider-${item.id}`" />
                    </template>
                  </v-virtual-scroll>

                  <v-list-item v-else>
                    <v-list-item-content>
                      <v-list-item-title class="font-weight-light text-center">
                        {{ $t(`users.no_studies`) }}
                      </v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                </v-skeleton-loader>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-expansion-panel-content>
    </v-expansion-panel>
  </v-expansion-panels>
</template>

<script>
import { isNumber } from 'lodash'

export default {
  components: {
    UserViewData: () => import('@/components/Users/UserViewData'),
    UserEditData: () => import('@/components/Users/UserEditData'),
    ProgressCircle: () => import('@/components/common/ProgressCircle')
  },
  props: {
    users: {
      type: Array,
      default: () => []
    },
    saving: {
      type: Boolean,
      default: false
    },
    deleting: {
      type: Boolean,
      default: false
    },
    loadingUser: {
      type: Number,
      default: 0
    },
    resending: {
      type: Boolean,
      default: false
    },
    errors: {
      type: Object,
      default: () => ({})
    }
  },
  data () {
    return {
      panel: null,
      editing: null
    }
  },
  watch: {
    panel (val) {
      if (isNumber(val)) {
        this.$emit('load-user', this.users[val].id)
      }
    }
  },
  methods: {
    clearEditing () {
      this.editing = null
    },
    statusColor (status) {
      return {
        active: 'green--text',
        pending: 'orange--text',
        inactive: 'red--text'
      }[status]
    },
    progress (item) {
      if (!item.participants_count) { return 0 }
      return item.finished_participants_count / item.participants_count * 100
    }
  }
}
</script>
