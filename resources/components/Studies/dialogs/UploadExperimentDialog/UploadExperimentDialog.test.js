import Vuetify from 'vuetify'
import { mount, createLocalVue } from '@vue/test-utils'
import UploadExperimentDialog from './UploadExperimentDialog.vue'

const localVue = createLocalVue()

describe('UploadExperimentDialog wrapper', () => {
  let vuetify
  let login

  beforeEach(() => {
    vuetify = new Vuetify()
    login = jest.fn()
  })

  function mountFunc (options = {}) {
    return mount(UploadExperimentDialog, {
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
