import Vuetify from 'vuetify'
import Vuex from 'vuex'
import flushPromises from 'flush-promises'
import axios from 'axios'

// import { Breakpoint } from 'vuetify/lib/services'
import { shallowMount, createLocalVue } from '@vue/test-utils'
import { Model } from '@vuex-orm/core'
import { STUDIES } from '@/assets/js/endpoints'

import * as storeIndex from '@/store'
import ArchivedStudies from './ArchivedStudies.vue'

jest.mock('axios')
Model.setAxios(axios)

const localVue = createLocalVue()
localVue.use(Vuex)

const user = { id: 1, name: 'User' }

describe('ArchivedStudies', () => {
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
    vuetify = new Vuetify({
      mocks: {
        $axios: axios,
        $auth: { user },
        $vuetify: {
          breakpoint: {}
        }
      }
    })
    jest.resetAllMocks()
    // Make sure the fetch() function works for all tests
    const response = { data: { data: [] } }
    axios.request.mockResolvedValue(response)
  })

  function mountFunc (options = {}) {
    return shallowMount(ArchivedStudies, {
      localVue,
      vuetify,
      store,
      mocks: {
        $axios: axios
      },
      ...options
    })
  }

  test('Data is fetched after creation of component', () => {
    mountFunc()
    expect(axios.request).toHaveBeenCalledWith({
      method: 'get',
      baseURL: STUDIES,
      save: true,
      dataKey: 'data',
      url: '',
      params: { active: false }
    })
  })

  test('Should notify the user after an error occurs', async () => {
    jest.resetAllMocks()
    axios.request.mockRejectedValue({ response: { data: { error: { message: 'Error' } } } })
    // Notify should not have been called yet.
    expect(actions.notify).not.toHaveBeenCalled()
    mountFunc()
    await flushPromises()
    // Notify should have been called
    expect(actions.notify).toHaveBeenCalled()
  })
})
