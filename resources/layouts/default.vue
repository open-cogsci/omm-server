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
        <v-list-item @click.stop="miniVariant = !miniVariant">
          <v-list-item-action>
            <v-icon>mdi-{{ `chevron-${miniVariant ? 'right' : 'left'}` }}</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title />
          </v-list-item-content>
        </v-list-item>

        <v-list-item
          v-for="(item, i) in items"
          :key="i"
          :to="item.to"
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
      <v-menu bottom offset-y left>
        <template v-slot:activator="{ on }">
          <v-btn
            x-large
            icon
            v-on="on"
          >
            <v-icon>mdi-account-circle</v-icon>
          </v-btn>
        </template>
        <v-list>
          <v-list-item :to="{name: 'dashboard-account'}" nuxt>
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
    <v-content>
      <v-container>
        <nuxt />
      </v-container>
    </v-content>
    <v-footer
      :fixed="fixed"
      app
    >
      <span>&copy; 2019</span>
    </v-footer>
    <notification-box />
  </v-app>
</template>

<script>
export default {
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
          icon: 'mdi-apps',
          title: 'Welcome',
          to: '/'
        },
        {
          icon: 'mdi-chart-bubble',
          title: 'Inspire',
          to: '/inspire'
        }
      ],
      miniVariant: false,
      title: 'OpenMonkeyMind'
    }
  },
  methods: {
    async logout () {
      try {
        await this.$auth.logout()
      } catch (e) {
        this.error = e + ''
      }
    }
  }
}
</script>
