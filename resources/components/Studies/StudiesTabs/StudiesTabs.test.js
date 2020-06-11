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
  let actions

  beforeEach(() => {
    actions = {
      notify: jest.fn()
    }
    store = new Vuex.Store({
      state: {},
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
    expect(wrapper.exists()).toBe(true)
  })
})
