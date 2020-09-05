import Vuetify from 'vuetify'
import { mount, createLocalVue } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import ConfirmationDialog from './ConfirmationDialog.vue'

const localVue = createLocalVue()

describe('ConfirmationDialog', () => {
  let vuetify

  beforeAll(() => {
    vuetify = new Vuetify()
  })

  beforeEach(() => {
    jest.resetAllMocks()
  })

  function mountFunc (options = {}) {
    return mount(ConfirmationDialog, {
      localVue,
      vuetify,
      mocks: {},
      propsData: {
        value: true
      },
      ...options
    })
  }

  it('Should not be visible by default', async () => {
    const wrapper = mountFunc()
    await flushPromises()
  })
})
