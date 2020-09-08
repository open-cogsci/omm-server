import Vuetify from 'vuetify'
import { mount, createLocalVue } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import SmoothReflow from './SmoothReflow.vue'

const localVue = createLocalVue()

describe('SmoothReflow', () => {
  let vuetify

  beforeAll(() => {
    vuetify = new Vuetify()
  })

  beforeEach(() => {
    jest.resetAllMocks()
  })

  function mountFunc (options = {}) {
    return mount(SmoothReflow, {
      localVue,
      vuetify,
      mocks: {},
      propsData: {
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
