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
        value: 'Test value',
        errors: []
      },
      ...options
    })
  }

  it('should match its snapshot', () => {
    const wrapper = mountFunc()
    expect(wrapper).toMatchSnapshot()
  })

  it('should successfully switch to edit mode and back', async () => {
    const wrapper = mountFunc()
    await flushPromises()
    expect(wrapper.find('.v-text-field').exists()).toBe(false)
    await wrapper.find('.v-btn').trigger('click')
    expect(wrapper.find('.v-text-field').exists()).toBe(true)
    await wrapper.find('button.mdi-cancel').trigger('click')
    expect(wrapper.find('.v-text-field').exists()).toBe(false)
  })

  it('should emit save event with value after click on save button', async () => {
    const wrapper = mountFunc()
    await flushPromises()
    await wrapper.find('.v-btn').trigger('click')
    const vTextField = wrapper.find('.v-text-field')
    expect(vTextField.exists()).toBe(true)
    const input = vTextField.find('input')
    const testValue = 'Input text'
    input.setValue(testValue)
    await wrapper.find('button.mdi-check').trigger('click')
    expect(wrapper.emitted('save')[0]).toEqual([testValue])
  })

  it('should disable save button and prevent emit of save event if validation fails', async () => {
    const wrapper = mountFunc({
      propsData: {
        rules: [v => v.length > 5 || 'Cannot be empty'],
        errors: []
      }
    })
    await flushPromises()
    await wrapper.find('.v-btn').trigger('click')
    const vTextField = wrapper.find('.v-text-field')
    expect(vTextField.classes()).not.toContain('error--text')
    const input = vTextField.find('input')
    await input.trigger('focus')
    await input.trigger('blur')
    const saveBtn = wrapper.find('button.mdi-check')
    expect(saveBtn.attributes('disabled')).toBe('disabled')
    await saveBtn.trigger('click')
    expect(wrapper.emitted('save')).toBeFalsy()
  })
})
