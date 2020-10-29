import Vuetify from 'vuetify'
import { mount, createLocalVue } from '@vue/test-utils'
import ParticipantSelector from './ParticipantSelector.vue'

const localVue = createLocalVue()

describe('ParticipantSelector', () => {
  let vuetify
  let login

  beforeEach(() => {
    vuetify = new Vuetify()
    login = jest.fn()
  })

  function mountFunc (options = {}) {
    return mount(ParticipantSelector, {
      localVue,
      vuetify,
      mocks: {
        $auth: {
          login,
          user: null
        }
      },
      stubs: ['nuxt-link'],
      ...options
    })
  }

  it('matches its snapshot', () => {
    const wrapper = mountFunc()
    expect(wrapper).toMatchSnapshot()
  })
})
