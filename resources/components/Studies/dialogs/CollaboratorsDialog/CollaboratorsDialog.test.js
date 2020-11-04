import Vuetify from 'vuetify'
import { mount, createLocalVue } from '@vue/test-utils'
import CollaboratorsDialog from './CollaboratorsDialog.vue'

const localVue = createLocalVue()

describe('CollaboratorsDialog wrapper', () => {
  let vuetify
  let login

  beforeEach(() => {
    vuetify = new Vuetify()
    login = jest.fn()
  })

  function mountFunc (options = {}) {
    return mount(CollaboratorsDialog, {
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
        value: true,
        'search-field': ''
      },
      ...options
    })
  }

  it('matches its snapshot', () => {
    const wrapper = mountFunc()
    expect(wrapper).toMatchSnapshot()
  })
})
