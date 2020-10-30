import Vuetify from 'vuetify'
import { mount, createLocalVue } from '@vue/test-utils'
import ParticipantEditData from './ParticipantEditData.vue'

const localVue = createLocalVue()

describe('ParticipantEditData wrapper', () => {
  let vuetify
  let login

  beforeEach(() => {
    vuetify = new Vuetify()
    login = jest.fn()
  })

  function mountFunc (options = {}) {
    return mount(ParticipantEditData, {
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
