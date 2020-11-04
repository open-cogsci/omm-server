import Vuetify from 'vuetify'
import { mount, createLocalVue } from '@vue/test-utils'
import NewParticipantDialog from './NewParticipantDialog.vue'

const localVue = createLocalVue()

describe('NewParticipantDialog wrapper', () => {
  let vuetify
  let login

  beforeEach(() => {
    vuetify = new Vuetify()
    login = jest.fn()
  })

  function mountFunc (options = {}) {
    return mount(NewParticipantDialog, {
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
        value: true,
        errors: {}
      },
      ...options
    })
  }

  it('matches its snapshot', () => {
    const wrapper = mountFunc()
    expect(wrapper).toMatchSnapshot()
  })
})
