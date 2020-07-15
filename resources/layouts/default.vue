<template>
  <v-app>
    <v-navigation-drawer
      v-model="drawer"
      :mini-variant="miniVariant"
      :clipped="clipped"
      fixed
      app
    >
      <v-list>
        <div class="d-flex d-sm-none">
          <v-list-item :to="localePath({name: 'dashboard-account'})" nuxt>
            <v-list-item-action>
              <v-icon>mdi-account</v-icon>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title>
                {{ $auth.user.name }}
              </v-list-item-title>
            </v-list-item-content>
            <v-list-item-action>
              <v-btn icon @click="logout">
                <v-icon color="grey">
                  mdi-logout
                </v-icon>
              </v-btn>
            </v-list-item-action>
          </v-list-item>
          <v-divider />
        </div>
        <v-list-item v-if="$vuetify.breakpoint.smAndUp" @click.stop="miniVariant = !miniVariant">
          <v-list-item-action>
            <v-icon>mdi-{{ `chevron-${miniVariant ? 'right' : 'left'}` }}</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title class="font-weight-light">
              Collapse menu
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-divider />
        <template v-for="(item, i) in items">
          <v-list-item
            v-if="!item.admin || (item.admin && $auth.user.user_type_id === 1 )"
            :key="i"
            :to="localePath(item.to)"
            router
            exact
          >
            <v-list-item-action>
              <v-icon>{{ item.icon }}</v-icon>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title v-text="item.title" />
            </v-list-item-content>
          </v-list-item>
        </template>
      </v-list>
    </v-navigation-drawer>
    <v-app-bar
      :clipped-left="clipped"
      fixed
      color="primary"
      dark
      app
    >
      <v-app-bar-nav-icon @click.stop="drawer = !drawer" />
      <v-img
        :src="require('@/assets/img/cogsci.png')"
        max-height="40"
        max-width="40"
        class="mx-2"
        contain
      />
      <v-toolbar-title>
        {{ title }}
      </v-toolbar-title>
      <v-spacer />
      <v-menu v-if="$vuetify.breakpoint.smAndUp" bottom offset-y left>
        <template v-slot:activator="{ on }">
          <v-btn text v-on="on">
            <v-icon left>
              mdi-account-circle
            </v-icon>
            {{ $auth.user.name }}
          </v-btn>
        </template>
        <v-list>
          <v-list-item :to="localePath({name: 'dashboard-account'})" nuxt>
            <v-list-item-icon>
              <v-icon>mdi-account</v-icon>
            </v-list-item-icon>
            <v-list-item-title>Account</v-list-item-title>
          </v-list-item>
          <v-list-item @click="logout">
            <v-list-item-icon>
              <v-icon>mdi-logout</v-icon>
            </v-list-item-icon>
            <v-list-item-title>Sign out</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>
    <v-main>
      <nuxt />
    </v-main>
    <v-footer :fixed="false" app>
      <span>&copy; 2019</span>
    </v-footer>
    <notification-box />
  </v-app>
</template>

<script>
import { mapActions } from 'vuex'
import { processErrors } from '@/assets/js/errorhandling'
import UserType from '@/models/UserType'

export default {
  name: 'DefaultLayout',
  components: {
    NotificationBox: () => import('@/components/NotificationBox')
  },
  data () {
    return {
      clipped: true,
      drawer: false,
      fixed: true,
      items: [
        {
          icon: 'mdi-view-dashboard',
          title: 'Dashboard',
          to: '/dashboard'
        },
        {
          icon: 'mdi-flask',
          title: 'Studies',
          to: '/dashboard/studies'
        },
        {
          icon: 'mdi-baby-face',
          title: 'Participants',
          to: '/dashboard/participants'
        },
        {
          icon: 'mdi-account-group',
          title: 'Users',
          to: '/dashboard/users',
          admin: true
        }
      ],
      miniVariant: false,
      title: 'OpenMonkeyMind'
    }
  },
  async created () {
    // Perform some bootstrapping. These requests are made only once when the app is loaded.

    // Get possible user types
    try {
      await UserType.fetch()
    } catch (e) {
      processErrors(e, this.notify)
    }
  },
  methods: {
    ...mapActions('notifications', ['notify']),
    async logout () {
      try {
        await this.$auth.logout()
      } catch (e) {
        this.error = e + ''
      }
    }
  },
  head () {
    return this.$nuxtI18nSeo()
  }
}
</script>
