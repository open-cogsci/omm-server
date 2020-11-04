import Vuetify from 'vuetify'
import { mount, createLocalVue } from '@vue/test-utils'
import NewUserDialog from './NewUserDialog.vue'

const localVue = createLocalVue()

describe('NewUserDialog', () => {
  let vuetify
  let login

  beforeEach(() => {
    vuetify = new Vuetify()
    login = jest.fn()
  })

  function mountFunc (options = {}) {
    return mount(NewUserDialog, {
      localVue,
      vuetify,
      mocks: {
        $auth: {
          login,
          user: null
        }
      },
      stubs: ['nuxt-link', 'user-edit-data'],
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
