import Vuetify from 'vuetify'
import { shallowMount, createLocalVue } from '@vue/test-utils'
import Login from './login.vue'

const localVue = createLocalVue()

describe('Login wrapper', () => {
  let vuetify

  beforeEach(() => {
    vuetify = new Vuetify()
  })

  function mountFunc (options = {}) {
    return shallowMount(Login, {
      localVue,
      vuetify,
      ...options
    })
  }

  it('Mounts and renders', () => {
    const wrapper = mountFunc()
    expect(wrapper.exists()).toBe(true)
  })
})
