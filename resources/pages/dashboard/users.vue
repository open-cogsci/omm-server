<template>
  <v-container>
    <new-user-dialog
      ref="dialog"
      v-model="dialog"
      :saving="saving"
      :errors.sync="errors"
      @save-user="saveUser"
    />
    <v-row>
      <v-col cols="12" xl="8" offset-xl="2">
        <v-row>
          <v-col cols="12">
            <h1 class="display-1 font-weight-light">
              Users
            </h1>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12">
            <v-skeleton-loader
              :loading="loading"
              type="table-row-divider@10"
            >
              <users-list
                ref="list"
                :users="users"
                :saving="saving"
                :deleting="deleting"
                :errors.sync="errors"
                @update-user="saveUser"
                @delete-user="deleteUser"
              />
            </v-skeleton-loader>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
    <v-fab-transition>
      <v-btn
        v-show="fabVisible"
        class="mb-12"
        color="accent"
        fab
        large
        dark
        bottom
        right
        absolute
        @click="dialog=true"
      >
        <v-icon>mdi-plus</v-icon>
      </v-btn>
    </v-fab-transition>
  </v-container>
</template>

<script>
import { mapActions } from 'vuex'
import { pick } from 'lodash'
import { processErrors } from '@/assets/js/errorhandling'

import User from '@/models/User'

export default {
  inject: ['theme'],
  components: {
    UsersList: () => import('@/components/Users/UsersList'),
    newUserDialog: () => import('@/components/Users/NewUserDialog')
  },
  data () {
    return {
      dialog: false,
      saving: false,
      loading: false,
      deleting: false,
      fabVisible: false,
      errors: {}
    }
  },
  computed: {
    users () {
      return User.query()
        .orderBy('name', 'asc')
        .get()
    }
  },
  created () {
    this.clearErrors(false)
    this.loadUsers()
  },
  mounted () {
    this.fabVisible = true
  },
  methods: {
    ...mapActions('notifications', ['notify']),
    /*
    * Fetch users from server
    */
    async loadUsers () {
      this.loading = true
      try {
        await User.fetch()
      } catch (e) {
        processErrors(e, this.notify)
      } finally {
        this.loading = false
      }
    },
    /**
     *  Save a user
     */
    async saveUser (ptcpData) {
      this.saving = true
      try {
        await User.persist(pick(ptcpData,
          ['$id', 'id', 'name', 'email', 'password', 'user_type_id', 'active']))
        this.notify({ message: 'User has been saved', color: 'success' })
        if (ptcpData.id) {
          this.$refs.list.clearEditing()
        } else {
          this.dialog = false
          this.$refs.dialog.clear()
        }
      } catch (e) {
        this.errors = processErrors(e, this.notify)
      } finally {
        this.saving = false
      }
    },
    /*
    *
    */
    async deleteUser (ptcpID) {
      this.deleting = true
      try {
        await User.destroy(ptcpID)
        this.notify({ message: 'User has been deleted', color: 'success' })
      } catch (e) {
        this.errors = processErrors(e, this.notify)
      } finally {
        this.deleting = false
      }
    },
    /**
     *  Clear possible validation errors sent by adonis after closing the dialog.
     */
    clearErrors (val) {
      if (!val) {
        this.errors = { name: '', email: '' }
      }
    }
  },
  head () {
    return {
      title: 'Users'
    }
  }
}
</script>
