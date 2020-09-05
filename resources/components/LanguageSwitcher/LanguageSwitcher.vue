<template>
  <v-list>
    <v-menu>
      <template v-slot:activator="{ on, attrs }">
        <v-list-item v-bind="attrs" v-on="on">
          <v-list-item-action>
            <v-img
              width="25"
              height="20"
              :src="require(`~/assets/img/${items[currentLocale].flag}`)"
            />
          </v-list-item-action>
          <v-list-item-content>
            {{ items[currentLocale].title }}
          </v-list-item-content>
        </v-list-item>
      </template>
      <v-list>
        <v-list-item-group v-model="currentLocale" color="primary">
          <v-list-item
            v-for="(item, locale) in items"
            :key="locale"
            :value="locale"
          >
            <v-list-item-action>
              <v-img width="25" height="20" :src="require(`~/assets/img/${item.flag}`)" />
            </v-list-item-action>
            <v-list-item-title>{{ item.title }}</v-list-item-title>
          </v-list-item>
        </v-list-item-group>
      </v-list>
    </v-menu>
  </v-list>
</template>

<script>
export default {
  data: () => ({
    items: {
      fr: {
        flag: 'flagFR.jpg',
        title: 'Français'
      },
      en: {
        flag: 'flagEN.jpg',
        title: 'English'
      },
      nl: {
        flag: 'flagNL.jpg',
        title: 'Nederlands'
      }
    }
  }),
  computed: {
    currentLocale: {
      get () {
        return this.$i18n?.locale
      },
      set (val) {
        this.$router.push(this.switchLocalePath(val))
        this.$emit('switched-locale', val)
      }
    }
  }
}
</script>
