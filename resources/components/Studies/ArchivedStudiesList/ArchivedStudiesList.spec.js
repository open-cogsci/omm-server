import Vuetify from 'vuetify'
import Vuex from 'vuex'
// import { Breakpoint } from 'vuetify/lib/services'
import { shallowMount, createLocalVue } from '@vue/test-utils'
import ArchivedStudiesList from './ArchivedStudiesList.vue'

const localVue = createLocalVue()
localVue.use(Vuex)

jest.mock('axios', () => ({
  $get: Promise.resolve({
    data: [
      { id: 1, name: 'Study 1', description: 'Description 1' },
      { id: 2, name: 'Study 1', description: 'Description 2' },
      { id: 3, name: 'Study 1', description: 'Description 3' }
    ]
  })
}))

describe('ArchivedStudiesList', () => {
  let vuetify
  let store
  // const opts = {}

  beforeEach(() => {
    const state = {
      current: {},
      pending: []
    }

    store = new Vuex.Store({
      state: {},
      modules: {
        notifications: {
          namespaced: true,
          state
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
  })

  function mountFunc (options = {}) {
    return shallowMount(ArchivedStudiesList, {
      store,
      localVue,
      vuetify,
      ...options
    })
  }

  test('is a Vue instance', () => {
    const wrapper = mountFunc()
    expect(wrapper.exists()).toBeTruthy()
  })

  test('Fetch has been called after', () => {
    const wrapper = mountFunc()
    expect(wrapper.exists()).toBeTruthy()
  })
})
