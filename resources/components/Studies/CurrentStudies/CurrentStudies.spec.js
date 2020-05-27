import Vuetify from 'vuetify'
import Vuex from 'vuex'
import flushPromises from 'flush-promises'
import axios from 'axios'

// import { Breakpoint } from 'vuetify/lib/services'
import { mount, createLocalVue } from '@vue/test-utils'
import CurrentStudies from './CurrentStudies.vue'
import { STUDIES } from '@/assets/js/endpoints'

jest.mock('axios')

const localVue = createLocalVue()
localVue.use(Vuex)

describe('CurrentStudies', () => {
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
    vuetify = new Vuetify()
    jest.resetAllMocks()
  })

  function mountFunc (options = {}) {
    // Required for Vuetify's v-dialog to work correctly
    document.body.setAttribute('data-app', true)
    return mount(CurrentStudies, {
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
    expect(axios.get).toHaveBeenCalledWith(STUDIES)
  })

  test('Should notify the user after an error occurs', async () => {
    axios.get.mockRejectedValue({ response: { data: { error: { message: 'Error' } } } })
    mountFunc()
    await flushPromises()
    expect(actions.notify).toHaveBeenCalled()
  })

  test('Shows the new study dialog when indicated', async () => {
    const wrapper = mountFunc({
      data: () => ({ dialog: false })
    })
    let dialog = wrapper.find('.v-dialog__container')
    expect(dialog.exists()).toBe(true)
    expect(dialog.find('.v-card').exists()).toBe(false)
    await wrapper.setData({ dialog: true })
    dialog = wrapper.find('.v-dialog__container')
    expect(dialog.find('.v-card').exists()).toBe(true)
  })

  test('Sends data to the server', async () => {
    const response = { data: { data: [] } }
    axios.post.mockResolvedValue(response)
    mountFunc()
  })
})
