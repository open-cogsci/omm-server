import Vuetify from 'vuetify'
import Vuex from 'vuex'
import axios from 'axios'
import faker from 'faker'

// import { Breakpoint } from 'vuetify/lib/services'
import { mount, createLocalVue } from '@vue/test-utils'
import { Model } from '@vuex-orm/core'
import flushPromises from 'flush-promises'
import ParticipationsPanel from './ParticipationsPanel.vue'
import * as storeIndex from '@/store'

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
            name: faker.name.findName(),
            users: [
              { name: faker.name.findName() },
              { name: faker.name.findName() }
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
