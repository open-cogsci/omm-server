<template>
  <v-container class="fill-height align-start">
    <new-user-dialog
      ref="dialog"
      v-model="dialog"
      :saving="saving"
      :errors.sync="errors"
      @save-user="saveUser"
    />
    <v-row class="fill-height">
      <v-col
        cols="12"
        xl="8"
        offset-xl="2"
        class="d-flex flex-column py-0"
      >
        <v-row class="align-self-start">
          <v-col cols="12">
            <h1 class="display-1 font-weight-light">
              {{ $t('layout.nav.users') }}
            </h1>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12">
            <v-text-field
              v-model="searchterm"
              solo
              prepend-inner-icon="mdi-magnify"
              :placeholder="$t('users.search')"
              hide-details
              clearable
              :loading="searching"
              @input="() => { pagination.page = 1; fetchUsers() }"
            />
          </v-col>
        </v-row>
        <v-row class="fill-height">
          <v-col ref="items" cols="12">
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
import { debounce, pick } from 'lodash'
import { processErrors } from '@/assets/js/errorhandling'

export default {
  name: 'UsersPage',
  // inject: ['theme'],
  components: {
    UsersList: () => import('@/components/Users/UsersList'),
    newUserDialog: () => import('@/components/Users/NewUserDialog')
  },
  data () {
    return {
      searchterm: '',
      searching: false,
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
        .where('id', this.pagination.ids)
        .get()
    }
  },
  created () {
    this.fetchUsers = debounce(this.fetchUsers, 250)
  },
  mounted () {
    this.fabVisible = true
    const vh = this.$refs.items.clientHeight
    this.pagination.perPage = Math.floor(vh / 60)
    this.fetchUsers()
  },
  methods: {
    ...mapActions('notifications', ['notify']),
    /*
    * Fetch users from server
    */
    async fetchUsers () {
      if (this.loading || this.searching) { return }
      try {
        const params = {
          page: this.pagination.page,
          perPage: this.pagination.perPage
        }
        if (this.searchterm && this.searchterm.length >= 2) {
          params.q = this.searchterm
          this.searching = true
        } else {
          this.loading = true
        }
        this.pagination = await this.User.fetch({ params })
      } catch (e) {
        processErrors(e, this.notify)
      } finally {
        this.searching = false
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
      if (this.saving) { return }
      this.saving = true
      try {
        const newRecord = await this.User.persist(pick(userData,
          ['$id', 'id', 'name', 'email', 'password', 'user_type_id', 'account_status']))
        this.notify({ message: this.$t('users.messages.saved'), color: 'success' })
        if (userData.id) {
          this.$refs.list.clearEditing()
        } else {
          this.dialog = false
          this.$refs.dialog.clear()
          this.pagination.ids.unshift(newRecord.response.data.data.id)
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
      if (this.deleting) { return }
      this.deleting = true
      try {
        await this.User.find(id).destroy()
        this.notify({ message: this.$t('users.messages.deleted'), color: 'success' })
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
      if (this.resending) { return }
      this.resending = true
      try {
        if (user.last_login) {
          await user.resendActivationEmail()
          this.notify({ message: this.$t('users.messages.activation_resent'), color: 'success' })
        } else {
          await user.resendAccountEmail()
          this.notify({ message: this.$t('users.messages.account_info_resent'), color: 'success' })
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
    }
  },
  head () {
    return {
      title: 'Users'
    }
  }
}
</script>
