import Vuetify from 'vuetify'
import { mount, createLocalVue } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import UnsavedChangesDialog from './UnsavedChangesDialog.vue'

const localVue = createLocalVue()

describe('UnsavedChangesDialog', () => {
  let vuetify

  beforeAll(() => {
    vuetify = new Vuetify()
  })

  beforeEach(() => {
    jest.resetAllMocks()
  })

  function mountFunc (options = {}) {
    return mount(UnsavedChangesDialog, {
      localVue,
      vuetify,
      mocks: {},
      propsData: {
        value: true
      },
      ...options
    })
  }

  it('should match its snapshot', async () => {
    const wrapper = mountFunc()
    await flushPromises()
    expect(wrapper).toMatchSnapshot()
  })
})
