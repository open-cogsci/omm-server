import Vuetify from 'vuetify'
import Vuex from 'vuex'
import flushPromises from 'flush-promises'
import axios from 'axios'

// import { Breakpoint } from 'vuetify/lib/services'
import { shallowMount, createLocalVue } from '@vue/test-utils'
import ArchivedStudies from './ArchivedStudies.vue'
import { STUDIES } from '@/assets/js/endpoints'

jest.mock('axios')

const localVue = createLocalVue()
localVue.use(Vuex)

describe('ArchivedStudies', () => {
  let vuetify
  let store
  let actions

  beforeEach(() => {
    const state = {
      current: {},
      pending: []
    }
    actions = {
      notify: jest.fn()
    }
    store = new Vuex.Store({
      state: {},
      modules: {
        notifications: {
          namespaced: true,
          state,
          actions
        }
      }
    })
    vuetify = new Vuetify({
      mocks: {
        $vuetify: {
          breakpoint: {}
        }
      }
    })
    jest.resetAllMocks()
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
    const response = { data: { data: [] } }
    axios.get.mockResolvedValue(response)
    mountFunc()
    expect(axios.get).toHaveBeenCalledWith(STUDIES, { params: { active: false } })
  })

  test('Should notify the user after an error occurs', async () => {
    axios.get.mockRejectedValue({ response: { data: { error: { message: 'Error' } } } })
    mountFunc()
    await flushPromises()
    expect(actions.notify).toHaveBeenCalled()
  })
})
