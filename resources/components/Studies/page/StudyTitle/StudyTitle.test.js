import Vuetify from 'vuetify'
import { mount, createLocalVue } from '@vue/test-utils'
import StudyTitle from './StudyTitle.vue'

const localVue = createLocalVue()

describe('StudyTitle wrapper', () => {
  let vuetify
  let login

  beforeEach(() => {
    vuetify = new Vuetify()
    login = jest.fn()
  })

  function mountFunc (options = {}) {
    return mount(StudyTitle, {
      localVue,
      vuetify,
      mocks: {
        $auth: {
          login,
          user: null
        }
      },
      propsData: {
        loading: false
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
