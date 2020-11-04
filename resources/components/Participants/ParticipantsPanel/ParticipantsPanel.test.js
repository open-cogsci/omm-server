import Vuetify from 'vuetify'
import Vuex from 'vuex'
import { mount, createLocalVue } from '@vue/test-utils'

// import flushPromises from 'flush-promises'
import axios from 'axios'
import { Model } from '@vuex-orm/core'
import ParticipantsPanel from './ParticipantsPanel.vue'

import * as storeIndex from '@/store'

jest.mock('axios')
Model.setAxios(axios)

const localVue = createLocalVue()
localVue.use(Vuex)

const user = { id: 1, name: 'User' }

describe('ParticipantsPanel', () => {
  let vuetify
  let actions
  let store
  let study

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

    study = {
      files: [],
      users: []
    }
  })

  function mountFunc (options = {}) {
    return mount(ParticipantsPanel, {
      localVue,
      vuetify,
      store,
      stubs: ['nuxt-link'],
      mocks: {
        $axios: axios,
        $auth: { user }
      },
      propsData: {
        study
      },
      ...options
    })
  }

  it('matches its snapshot', () => {
    const wrapper = mountFunc()
    expect(wrapper).toMatchSnapshot()
  })
})
