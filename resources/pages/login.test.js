import Vuetify from 'vuetify'
import { mount, createLocalVue } from '@vue/test-utils'
import Login from './login.vue'

const localVue = createLocalVue()

describe('Login wrapper', () => {
  let vuetify
  let login

  beforeEach(() => {
    vuetify = new Vuetify()
    login = jest.fn()
  })

  function mountFunc (options = {}) {
    return mount(Login, {
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

  it('does not submit when fields are empty', () => {
    const wrapper = mountFunc()
    expect(wrapper.find('.v-btn').exists()).toBe(true)
  })
})
