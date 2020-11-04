import Vuetify from 'vuetify'
import { mount, createLocalVue } from '@vue/test-utils'
import ParticipantSelector from './ParticipantSelector.vue'

const localVue = createLocalVue()

describe('ParticipantSelector', () => {
  let vuetify
  let login
  let participants
  let selected

  beforeEach(() => {
    vuetify = new Vuetify()
    login = jest.fn()
    selected = [1]
    participants = [
      { id: 1 }
    ]
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
      stubs: ['nuxt-link', 'smooth-reflow'],
      propsData: {
        participants,
        selected
      },
      ...options
    })
  }

  it('matches its snapshot', () => {
    const wrapper = mountFunc()
    expect(wrapper).toMatchSnapshot()
  })
})
