import Vuetify from 'vuetify'
import { mount, createLocalVue } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import NewStudyDialog from './NewStudyDialog.vue'
const localVue = createLocalVue()

describe('NewStudyDialog', () => {
  let vuetify

  beforeAll(() => {
    vuetify = new Vuetify()
  })

  function mountFunc (options = {}) {
    return mount(NewStudyDialog, {
      localVue,
      vuetify,
      propsData: {
        value: true
      },
      ...options
    })
  }

  it('should mount succesfully and completely', () => {
    const wrapper = mountFunc()
    flushPromises()
    expect(wrapper.find('.v-input.v-text-field input[type="text"]').exists()).toBe(true)
    expect(wrapper.find('.v-input.v-textarea textarea').exists()).toBe(true)
    expect(wrapper.find('button.v-btn.success--text').exists()).toBe(true)
    expect(wrapper.findAll('.v-btn').length).toBe(2)
  })

  it('should show error message on empty value for the title field', async () => {
    const wrapper = mountFunc()
    const titleField = wrapper.get('.v-text-field')
    // No errors should be set
    expect(titleField.classes()).not.toContain('error--text')
    expect(titleField.find('.v-messages__message').exists()).toBe(false)
    // Focussing and blurring the title field should show a required error
    const titleInput = titleField.get('input')
    await titleInput.trigger('focus')
    await titleInput.trigger('blur')
    expect(titleField.classes()).toContain('error--text')
    expect(titleField.find('.v-messages__message').exists()).toBe(true)
    // Entering data should remove the error.
    await wrapper.setData({ study: { name: 'Something' } })
    await wrapper.vm.$nextTick()
    expect(titleField.classes()).not.toContain('error--text')
    expect(titleField.find('.v-messages__message').exists()).toBe(false)
  })

  it('should show error messages for the title field  on too long input', async () => {
    const wrapper = mountFunc()
    const titleField = wrapper.get('.v-text-field')
    // No errors should be set
    expect(titleField.classes()).not.toContain('error--text')
    expect(titleField.find('.v-messages__message').exists()).toBe(false)
    // Entering data should remove the error.
    wrapper.setData({ study: { name: 'Something'.repeat(20) } })
    await flushPromises()
    expect(titleField.classes()).toContain('error--text')
    expect(titleField.get('.v-messages__message').exists()).toBe(true)
  })

  it('should show validation messages the for description field on too long input', async () => {
    const wrapper = mountFunc()
    const descField = wrapper.get('.v-textarea')
    expect(descField.classes()).not.toContain('error--text')
    expect(descField.find('.v-messages__message').exists()).toBe(false)
    // Entering data should remove the error.
    wrapper.setData({ study: { description: 'Something'.repeat(20) } })
    await flushPromises()
    expect(descField.classes()).toContain('error--text')
    expect(descField.get('.v-messages__message').exists()).toBe(true)
  })

  it('should handle save button presses correctly', async () => {
    const study = { name: 'Something', description: 'Something' }
    const wrapper = mountFunc()
    await flushPromises()
    // The button should be disabled at first
    const saveBtn = wrapper.find('.v-card__actions').findAll('button.v-btn').at(1)
    expect(saveBtn.attributes('disabled')).toBe('disabled')
    // Force a save action and see if that guard works too
    wrapper.vm.save()
    expect(wrapper.emitted('clicked-save')).not.toBeTruthy()
    // Set data to make save button available
    wrapper.setData({ study })
    await flushPromises()
    expect(saveBtn.attributes()).not.toContain('disabled')
    await saveBtn.trigger('click')
    expect(wrapper.emitted('clicked-save')[0]).toEqual([study])
  })

  it('should handle cancel button presses correctly', async () => {
    const wrapper = mountFunc()
    const cancelBtn = wrapper.find('.v-card__actions').findAll('button.v-btn').at(0)
    await cancelBtn.trigger('click')
    expect(wrapper.emitted('input')[0]).toEqual([false])
  })

  it('should clear the form data when the dialog closes', async () => {
    const wrapper = mountFunc({
      data () {
        return { study: { name: 'Something', description: 'Something' } }
      }
    })
    await flushPromises()
    await wrapper.setProps({ value: false })
    expect(wrapper.vm.study).toEqual({ name: '', description: '' })
  })

  it('should clear server validation errors when new input is provided', async () => {
    const wrapper = mountFunc({
      propsData: {
        value: true,
        errors: { name: 'Invalid', description: 'Invalid' }
      }
    })
    await flushPromises()
    // Errors should be shown if error prop is populated
    const titleField = wrapper.get('.v-text-field')
    expect(titleField.classes()).toContain('error--text')
    expect(titleField.get('.v-messages__message').exists()).toBe(true)
    const descField = wrapper.get('.v-textarea')
    expect(descField.classes()).toContain('error--text')
    expect(descField.get('.v-messages__message').exists()).toBe(true)

    titleField.get('input').trigger('input', 'new value')
    await flushPromises()
    expect(wrapper.emitted('update:errors').length).toBe(1)
    expect(wrapper.emitted('update:errors')[0]).toEqual([{ description: 'Invalid', name: '' }])
    descField.get('textarea').trigger('input', 'new value')
    await flushPromises()
    expect(wrapper.emitted('update:errors').length).toBe(2)
    expect(wrapper.emitted('update:errors')[1]).toEqual([{ description: '', name: 'Invalid' }])
  })
})
