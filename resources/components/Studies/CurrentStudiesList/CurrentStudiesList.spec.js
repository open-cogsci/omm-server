import Vuetify from 'vuetify'
import Vuex from 'vuex'
// import { Breakpoint } from 'vuetify/lib/services'
import { shallowMount, createLocalVue } from '@vue/test-utils'
import CurrentStudiesList from './CurrentStudiesList.vue'

const localVue = createLocalVue()
localVue.use(Vuex)

describe('CurrentStudiesList', () => {
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
    return shallowMount(CurrentStudiesList, {
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
