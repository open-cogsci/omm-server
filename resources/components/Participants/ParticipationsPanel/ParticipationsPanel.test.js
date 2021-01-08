import Vuetify from 'vuetify'
import Vuex from 'vuex'
import axios from 'axios'

// import { Breakpoint } from 'vuetify/lib/services'
import { mount, createLocalVue } from '@vue/test-utils'
import { Model } from '@vuex-orm/core'
import flushPromises from 'flush-promises'
import * as storeIndex from '@/store'
import ParticipationsPanel from './ParticipationsPanel.vue'

jest.mock('axios')
Model.setAxios(axios)

const localVue = createLocalVue()
localVue.use(Vuex)

const user = { id: 1, name: 'User' }

describe('ParticipationsPanel', () => {
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
    return mount(ParticipationsPanel, {
      localVue,
      store,
      vuetify,
      mocks: {
        $auth: {
          login,
          user
        }
      },
      propsData: {
        participant: {
          studies: [{
            name: 'Study name',
            users: [
              { name: 'Participant 1' },
              { name: 'Participant 2' }
            ]
          }]
        }
      },
      stubs: ['nuxt-link'],
      ...options
    })
  }

  it('matches its snapshot', async () => {
    const wrapper = mountFunc()
    await flushPromises()
    expect(wrapper).toMatchSnapshot()
  })
})
