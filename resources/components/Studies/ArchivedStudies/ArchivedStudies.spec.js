import Vuetify from 'vuetify'
import Vuex from 'vuex'
import flushPromises from 'flush-promises'
import axios from 'axios'

// import { Breakpoint } from 'vuetify/lib/services'
import { shallowMount, createLocalVue } from '@vue/test-utils'
import ArchivedStudiesList from './ArchivedStudiesList.vue'
import { STUDIES } from '@/assets/js/endpoints'

jest.mock('axios')

const localVue = createLocalVue()
localVue.use(Vuex)

describe('ArchivedStudiesList', () => {
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
    return shallowMount(ArchivedStudiesList, {
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

  test('Data is shown after reception', async () => {
    const studies = [{ id: 1, name: 'Test study', description: 'Description' }]
    const response = { data: { data: studies } }
    axios.get.mockResolvedValue(response)
    const wrapper = mountFunc()
    // Wait until all promises have resolved
    await flushPromises()
    // Wait until component is rerendered
    await wrapper.vm.$nextTick()

    // Expect a list item to be created
    const listItem = wrapper.find('.v-list-item')
    expect(listItem.exists()).toBe(true)

    // Expect a list item title to be same as study name
    expect(listItem.find('.v-list-item__title').text()).toBe(studies[0].name)
    // Expect a list item description to be the same as study name
    expect(listItem.find('.v-list-item__subtitle').text()).toBe(studies[0].description)
  })

  test('Skeleton is shown during loading', async () => {
    const response = { data: { data: [] } }
    axios.get.mockResolvedValue(response)
    const wrapper = mountFunc()
    expect(wrapper.find('.v-skeleton-loader').exists()).toBe(true)
    expect(wrapper.find('.v-list-item').exists()).toBe(false)
    await flushPromises()
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.v-skeleton-loader').exists()).toBe(false)
  })

  test('Should notify the user after an error occurs', async () => {
    axios.get.mockRejectedValue({ response: { data: { error: { message: 'Error' } } } })
    mountFunc()
    await flushPromises()
    expect(actions.notify).toHaveBeenCalled()
  })
})
