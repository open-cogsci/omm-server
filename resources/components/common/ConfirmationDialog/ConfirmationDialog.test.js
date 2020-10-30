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

  it('should not be visible by default', async () => {
    const wrapper = mountFunc({ propsData: { value: false } })
    await flushPromises()
    expect(wrapper.find('.v-card').exists()).toBe(false)
    await wrapper.setProps({ value: true })
    expect(wrapper.find('.v-card').exists()).toBe(true)
  })

  it('should emit the correct events on corresponding buttons clicks', async () => {
    const wrapper = mountFunc()
    await flushPromises()
    const btns = wrapper.findAll('.v-card__actions .v-btn')
    expect(btns.length).toBe(2)
    const cancelBtn = btns.at(0)
    const saveBtn = btns.at(1)
    expect(wrapper.emitted('clicked-no')).toBeFalsy()
    await cancelBtn.trigger('click')
    expect(wrapper.emitted('clicked-no').length).toBe(1)
    expect(wrapper.emitted('clicked-yes')).toBeFalsy()
    await saveBtn.trigger('click')
    expect(wrapper.emitted('clicked-yes').length).toBe(1)
  })
})
