import Vuetify from 'vuetify'
import { mount, createLocalVue } from '@vue/test-utils'
import PriorityDial from './PriorityDial.vue'

const localVue = createLocalVue()

describe('PriorityDial', () => {
  let vuetify
  let login
  let participation

  beforeEach(() => {
    vuetify = new Vuetify()
    login = jest.fn()
    participation = {
      priority: 1
    }
  })

  function mountFunc (options = {}) {
    return mount(PriorityDial, {
      localVue,
      vuetify,
      mocks: {
        $auth: {
          login,
          user: null
        }
      },
      stubs: ['nuxt-link'],
      propsData: {
        participation
      },
      ...options
    })
  }

  it('matches its snapshot', () => {
    const wrapper = mountFunc()
    expect(wrapper).toMatchSnapshot()
  })
})
