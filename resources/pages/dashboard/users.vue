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
                :loading-user="loadingUser"
                :saving="saving"
                :deleting="deleting"
                :resending="resending"
                :errors.sync="errors"
                @update-user="saveUser"
                @delete-user="deleteUser"
                @resend-email="resendAccountEmail"
                @load-user="loadUser"
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
  name: 'UsersPage',
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
      loadingUser: 0,
      deleting: false,
      resending: false,
      fabVisible: false,
      errors: {}
    }
  },
  computed: {
    users () {
      return User.query()
        .with('user_type')
        .with('studies')
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
    /** Load a single user */
    async loadUser (id) {
      this.loadingUser = id
      try {
        await User.fetchById(id)
      } catch (e) {
        this.errors = processErrors(e, this.notify)
      }
      this.loadingUser = 0
    },
    /**
     *  Save a user
     */
    async saveUser (userData) {
      this.saving = true
      try {
        await User.persist(pick(userData,
          ['$id', 'id', 'name', 'email', 'password', 'user_type_id', 'account_status']))
        this.notify({ message: 'User has been saved', color: 'success' })
        if (userData.id) {
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
    * Delete a user
    */
    async deleteUser (id) {
      this.deleting = true
      try {
        await User.destroy(id)
        this.notify({ message: 'User has been deleted', color: 'success' })
      } catch (e) {
        this.errors = processErrors(e, this.notify)
      } finally {
        this.deleting = false
      }
    },
    /**
     * Resend email containing user password
     */
    async resendAccountEmail (userId) {
      this.resending = true
      try {
        await User.resendAccountEmail(userId)
        this.notify({ message: 'Account info e-mail has been resent', color: 'success' })
      } catch (e) {
        this.errors = processErrors(e, this.notify)
      } finally {
        this.resending = false
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
