import Vuetify from 'vuetify'
import { mount, createLocalVue } from '@vue/test-utils'
import UserViewData from './UserViewData.vue'

const localVue = createLocalVue()

const user = { id: 1, name: 'User' }

describe('UserViewData wrapper', () => {
  let vuetify
  let viewUser

  beforeEach(() => {
    vuetify = new Vuetify()
    viewUser = {

    }
  })

  function mountFunc (options = {}) {
    return mount(UserViewData, {
      localVue,
      vuetify,
      mocks: {
        $auth: {
          user
        }
      },
      stubs: ['nuxt-link'],
      propsData: {
        user: viewUser
      },
      ...options
    })
  }

  it('matches its snapshot', () => {
    const wrapper = mountFunc()
    expect(wrapper).toMatchSnapshot()
  })
})
