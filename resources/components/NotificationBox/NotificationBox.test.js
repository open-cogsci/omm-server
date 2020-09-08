import Vuetify from 'vuetify'
import Vuex from 'vuex'
import { shallowMount, createLocalVue } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import NotificationBox from './NotificationBox.vue'

const localVue = createLocalVue()
localVue.use(Vuex)

describe('NotificationBox', () => {
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
    return shallowMount(NotificationBox, {
      store,
      localVue,
      vuetify,
      ...options
    })
  }

  it('should match its snapshot', async () => {
    const wrapper = mountFunc()
    await flushPromises()
    expect(wrapper).toMatchSnapshot()
  })
})
