import Vuetify from 'vuetify'
import { mount, createLocalVue } from '@vue/test-utils'
import ParticipantsPanel from './ParticipantsPanel.vue'

const localVue = createLocalVue()

describe('ParticipantsPanel', () => {
  let vuetify
  let login

  beforeEach(() => {
    vuetify = new Vuetify()
    login = jest.fn()
  })

  function mountFunc (options = {}) {
    return mount(ParticipantsPanel, {
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
