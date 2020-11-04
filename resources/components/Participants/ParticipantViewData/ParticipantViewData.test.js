import Vuetify from 'vuetify'
import { mount, createLocalVue } from '@vue/test-utils'
import ParticipantViewData from './ParticipantViewData.vue'

const localVue = createLocalVue()

const user = { id: 1, name: 'User' }

describe('ParticipantViewData wrapper', () => {
  let vuetify
  let login
  let participant

  beforeEach(() => {
    vuetify = new Vuetify()
    login = jest.fn()
    participant = {
      name: 'John Doe',
      identifier: 'abcdef'
    }
  })

  function mountFunc (options = {}) {
    return mount(ParticipantViewData, {
      localVue,
      vuetify,
      mocks: {
        $auth: {
          login,
          user
        }
      },
      stubs: ['nuxt-link'],
      propsData: {
        participant
      },
      ...options
    })
  }

  it('matches its snapshot', () => {
    const wrapper = mountFunc()
    expect(wrapper).toMatchSnapshot()
  })
})
