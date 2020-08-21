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
            <v-text-field
              solo
              prepend-inner-icon="mdi-magnify"
              placeholder="Search"
              hide-details
            />
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
        <v-row>
          <v-col cols="12">
            <v-pagination
              :value="pagination.page"
              :length="pagination.lastPage"
              @input="switchPage"
            />
          </v-col>
        </v-row>
      </v-col>
    </v-row>
    <v-fab-transition>
      <v-btn
        v-if="$auth.user.user_type_id === 1"
        v-show="fabVisible"
        class="mb-12"
        color="accent"
        fab
        large
        dark
        bottom
        right
        fixed
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
      errors: {},
      pagination: {
        page: 1,
        perPage: 12
      }
    }
  },
  computed: {
    User () {
      return this.$store.$db().model('users')
    },
    users () {
      return this.User.query()
        .with(['user_type', 'studies'])
        .orderBy('name', 'asc')
        .offset((this.pagination.page - 1) * this.pagination.perPage)
        .limit(this.pagination.perPage)
        .get()
    }
  },
  created () {
    this.clearErrors(false)
    this.fetchUsers()
  },
  mounted () {
    this.fabVisible = true
  },
  methods: {
    ...mapActions('notifications', ['notify']),
    /*
    * Fetch users from server
    */
    async fetchUsers () {
      this.loading = true
      try {
        this.pagination = await this.User.fetch({
          params: {
            page: this.pagination.page,
            perPage: this.pagination.perPage
          }
        })
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
        await this.User.fetchById(id)
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
        await this.User.persist(pick(userData,
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
        await this.User.find(id).destroy()
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
    async resendAccountEmail (user) {
      this.resending = true
      try {
        if (user.last_login) {
          await user.resendActivationEmail()
          this.notify({ message: 'Activation e-mail has been resent', color: 'success' })
        } else {
          await user.resendAccountEmail()
          this.notify({ message: 'Account info e-mail has been resent', color: 'success' })
        }
      } catch (e) {
        this.errors = processErrors(e, this.notify)
      } finally {
        this.resending = false
      }
    },
    /*
     * Switch page
     */
    switchPage (page) {
      if (page !== this.pagination.page) {
        this.pagination.page = page
        this.fetchUsers()
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
