import Vuetify from 'vuetify'
import { shallowMount, createLocalVue } from '@vue/test-utils'
import Index from './index.vue'

const localVue = createLocalVue()

describe('Index', () => {
  let vuetify

  beforeEach(() => {
    vuetify = new Vuetify()
  })

  function mountFunc (options = {}) {
    return shallowMount(Index, {
      localVue,
      vuetify,
      ...options
    })
  }

  it('redirects users to dashboard if they are logged in ', () => {
    const replace = jest.fn()
    mountFunc({
      mocks: {
        $auth: {
          loggedIn: true
        },
        $router: {
          replace
        }
      }
    })
    expect(replace.mock.calls.length).toBe(1)
    expect(replace.mock.calls[0][0]).toEqual({ name: 'dashboard' })
  })

  it('redirects users to the login page if they are not logged in ', () => {
    const replace = jest.fn()
    mountFunc({
      mocks: {
        $auth: {
          loggedIn: false
        },
        $router: {
          replace
        }
      }
    })
    expect(replace.mock.calls.length).toBe(1)
    expect(replace.mock.calls[0][0]).toEqual({ name: 'login' })
  })
})
