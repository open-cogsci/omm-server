import Vuetify from 'vuetify'
import { shallowMount, createLocalVue } from '@vue/test-utils'
import Dashboard from './dashboard.vue'

const localVue = createLocalVue()

describe('Dashboard wrapper', () => {
  let vuetify

  beforeEach(() => {
    vuetify = new Vuetify()
  })

  function mountFunc (options = {}) {
    return shallowMount(Dashboard, {
      localVue,
      vuetify,
      stubs: ['nuxt-child'],
      ...options
    })
  }

  it('Mounts and renders', () => {
    const wrapper = mountFunc()
    expect(wrapper.exists()).toBe(true)
  })
})
