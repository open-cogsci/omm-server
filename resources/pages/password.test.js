import Vuetify from 'vuetify'
import { shallowMount, createLocalVue } from '@vue/test-utils'
import Password from './password.vue'

const localVue = createLocalVue()

describe('Password wrapper', () => {
  let vuetify

  beforeEach(() => {
    vuetify = new Vuetify()
  })

  function mountFunc (options = {}) {
    return shallowMount(Password, {
      localVue,
      vuetify,
      ...options
    })
  }

  it('Mounts and renders', () => {
    const wrapper = mountFunc()
    expect(wrapper.exists()).toBe(true)
  })

  it('Should match snapshot', () => {
    const wrapper = mountFunc()
    expect(wrapper).toMatchSnapshot()
  })
})
