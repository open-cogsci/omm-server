import Vue from 'vue'
import Vuetify from 'vuetify'
import { config } from '@vue/test-utils'
import { Plugin } from 'vue-fragment'
import '../plugins/mixins'

Vue.use(Plugin)
Vue.use(Vuetify)

config.mocks.$t = key => key
config.mocks.localePath = v => v

// Necessary for components such as v-dialog and v-menu to function correctly
const app = document.createElement('div')
app.setAttribute('data-app', true)
document.body.appendChild(app)
