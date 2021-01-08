import Vuetify from 'vuetify'
import Vuex from 'vuex'
import axios from 'axios'

import { mount, createLocalVue } from '@vue/test-utils'
import { Model } from '@vuex-orm/core'
import * as storeIndex from '@/store'
import ManageDialog from './ManageDialog.vue'

jest.mock('axios')
Model.setAxios(axios)

const localVue = createLocalVue()
localVue.use(Vuex)

const user = { id: 1, name: 'User' }

describe('ManageDialog', () => {
  let vuetify
  let store
  let actions

  beforeEach(() => {
    actions = {
      notify: jest.fn()
    }
    store = new Vuex.Store({
      ...storeIndex,
      modules: {
        notifications: {
          namespaced: true,
          state: {
            current: {},
            pending: []
          },
          actions
        }
      }
    })
    vuetify = new Vuetify()
    jest.resetAllMocks()

    // Make sure the fetch() function works for all tests
    const response = { data: { data: [] } }
    axios.request.mockResolvedValue(response)
  })

  function mountFunc (options = {}) {
    return mount(ManageDialog, {
      localVue,
      vuetify,
      store,
      stubs: ['nuxt-link', 'smooth-reflow'],
      mocks: {
        $axios: axios,
        $auth: { user }
      },
      propsData: {
        value: true,
        study: {}
      },
      ...options
    })
  }

  it('matches its snapshot', () => {
    const wrapper = mountFunc()
    expect(wrapper).toMatchSnapshot()
  })
})
