import Vuetify from 'vuetify'
import { mount, createLocalVue } from '@vue/test-utils'
import Password from './recover.vue'

const localVue = createLocalVue()

describe('Password wrapper', () => {
  let vuetify

  beforeEach(() => {
    vuetify = new Vuetify()
  })

  function mountFunc (options = {}) {
    return mount(Password, {
      localVue,
      vuetify,
      ...options,
      mocks: {
        localePath: v => v
      },
      stubs: ['nuxt-link']
    })
  }

  it('matches its snapshot', () => {
    const wrapper = mountFunc()
    expect(wrapper).toMatchSnapshot()
  })
})
