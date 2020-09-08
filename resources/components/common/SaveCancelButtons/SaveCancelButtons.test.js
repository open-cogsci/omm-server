import Vue from 'vue'
import Vuetify from 'vuetify'
import { mount, createLocalVue } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import SaveCancelButtons from './SaveCancelButtons.vue'

const localVue = createLocalVue()

// Fragment needs a parent to function correctly so wrap the component
const WrapperComponent = Vue.component('WrapperComponent', {
  template: '<div><slot></slot></div>'
})

describe('SaveCancelButtons', () => {
  let vuetify

  beforeAll(() => {
    vuetify = new Vuetify()
  })

  beforeEach(() => {
    jest.resetAllMocks()
  })

  function mountFunc (options = {}) {
    return mount(WrapperComponent, {
      localVue,
      slots: {
        default: SaveCancelButtons
      },
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
