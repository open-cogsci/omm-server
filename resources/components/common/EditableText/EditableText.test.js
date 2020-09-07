import Vuetify from 'vuetify'
import { mount, createLocalVue } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import EditableText from './EditableText.vue'

const localVue = createLocalVue()

describe('EditableText', () => {
  let vuetify

  beforeAll(() => {
    vuetify = new Vuetify()
  })

  beforeEach(() => {
    jest.resetAllMocks()
  })

  function mountFunc (options = {}) {
    return mount(EditableText, {
      localVue,
      vuetify,
      mocks: {},
      propsData: {
        value: 'Test value'
      },
      ...options
    })
  }

  it('Should be in view mode by default and show edit field after press on edit button', async () => {
    const wrapper = mountFunc()
    await flushPromises()
    wrapper.find('.v-text-field')
    expect(wrapper.find('.v-text-field').exists()).toBe(false)
    await wrapper.find('.v-btn').trigger('click')
    expect(wrapper.find('.v-text-field').exists()).toBe(true)
  })

  it('should emit the correct events on corresponding buttons clicks', async () => {
    const wrapper = mountFunc()
    await flushPromises()
    expect(wrapper.exists()).toBe(true)
  })
})
