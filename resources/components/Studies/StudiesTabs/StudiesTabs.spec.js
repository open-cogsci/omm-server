import Vuetify from 'vuetify'
import Vuex from 'vuex'
// import { Breakpoint } from 'vuetify/lib/services'
import { shallowMount, createLocalVue } from '@vue/test-utils'
import StudiesTabs from './StudiesTabs.vue'

const localVue = createLocalVue()
localVue.use(Vuex)

describe('StudiesTabs', () => {
  let vuetify
  let store
  // const opts = {}

  beforeEach(() => {
    const state = {
      current: {},
      pending: []
    }
    const actions = {
      pop: jest.fn()
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
  })

  function mountFunc (options = {}) {
    return shallowMount(StudiesTabs, {
      store,
      localVue,
      vuetify,
      ...options
    })
  }

  test('is a Vue instance', () => {
    const wrapper = mountFunc()
    expect(wrapper.isVueInstance()).toBeTruthy()
  })
})
