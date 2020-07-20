import Vuetify from 'vuetify'
import { shallowMount, createLocalVue } from '@vue/test-utils'
import Password from './recover.vue'

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
      ...options,
      mocks: {
        localePath: v => v
      }
    })
  }

  it('matches its snapshot', () => {
    const wrapper = mountFunc()
    expect(wrapper).toMatchSnapshot()
  })
})
