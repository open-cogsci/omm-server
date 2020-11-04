import Vuetify from 'vuetify'
import Vuex from 'vuex'
import axios from 'axios'

// import { Breakpoint } from 'vuetify/lib/services'
import { mount, createLocalVue } from '@vue/test-utils'
import { Model } from '@vuex-orm/core'
import Index from './index.vue'
import * as storeIndex from '@/store'

jest.mock('axios')
Model.setAxios(axios)

const localVue = createLocalVue()
localVue.use(Vuex)

const user = { id: 1, name: 'User' }

describe('Dashboard Index', () => {
  let vuetify
  let login
  let actions
  let store

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
    return mount(Index, {
      localVue,
      store,
      vuetify,
      mocks: {
        $auth: {
          login,
          user
        }
      },
      stubs: ['nuxt-link'],
      ...options
    })
  }

  it('matches its snapshot', () => {
    const wrapper = mountFunc()
    expect(wrapper).toMatchSnapshot()
  })
})
