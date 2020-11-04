import Vuetify from 'vuetify'
import { mount, createLocalVue } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import DataDownloadDialog from './DataDownloadDialog.vue'

const localVue = createLocalVue()

const oldWindowLocation = window.location
delete window.location

describe('DataDownloadDialog', () => {
  let vuetify

  beforeAll(() => {
    vuetify = new Vuetify()
    window.location = Object.defineProperties(
      {},
      {
        ...Object.getOwnPropertyDescriptors(oldWindowLocation),
        assign: {
          configurable: true,
          value: jest.fn()
        }
      }
    )
  })

  beforeEach(() => {
    jest.resetAllMocks()
  })

  afterAll(() => {
  // restore `window.location` to the `jsdom` `Location` object
    window.location = oldWindowLocation
  })

  function mountFunc (options = {}) {
    return mount(DataDownloadDialog, {
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

  it('matches its snapshot', () => {
    const wrapper = mountFunc()
    expect(wrapper).toMatchSnapshot()
  })

  it('should send a close event if the close button is clicked', async () => {
    const wrapper = mountFunc()
    await flushPromises()
    expect(wrapper.emitted('input')).toBeFalsy()
    const closeBtn = wrapper.find('.v-card__actions button')
    await closeBtn.trigger('click')
    expect(wrapper.emitted('input')).toBeTruthy()
  })

  it('should emit generate events when the three center buttons are clicked', async () => {
    const wrapper = mountFunc()
    await flushPromises()
    expect(wrapper.emitted('generate')).toBeFalsy()
    const fileButtons = wrapper.findAll('.v-card__text button')
    expect(fileButtons.length).toBe(3)
    await fileButtons.trigger('click')
    expect(wrapper.emitted('generate').length).toBe(3)
    expect(wrapper.emitted('generate').map(item => item[0])).toEqual(['csv', 'xlsx', 'ods'])
  })

  it('should attempt a download if a generate event is complete', async () => {
    const dlSpy = jest.spyOn(DataDownloadDialog.methods, 'download')
    const wrapper = mountFunc()
    await flushPromises()
    expect(dlSpy).toHaveBeenCalledTimes(0)
    const fileButton = wrapper.find('.v-card__text button')
    await fileButton.trigger('click')
    expect(wrapper.emitted('generate').length).toBe(1)
    const fileType = wrapper.emitted('generate')[0][0]
    await wrapper.setProps({
      value: true,
      generating: fileType
    })
    expect(wrapper.vm.watchType).toBe(fileType)
    await wrapper.setProps({
      value: true,
      generating: null,
      files: [{
        type: `data-${fileType}`,
        path: 'some/path'
      }]
    })
    expect(dlSpy).toHaveBeenCalledTimes(1)
    expect(dlSpy).toHaveBeenCalledWith('csv')
    // Check if download is called now file is generated and button is clicked again
    await fileButton.trigger('click')
    expect(dlSpy).toHaveBeenCalledTimes(1)
    dlSpy.mockReset()
  })

  it('should show download cached buttons if files are already present', async () => {
    const dlSpy = jest.spyOn(DataDownloadDialog.methods, 'download')
    expect(dlSpy).toHaveBeenCalledTimes(0)
    const wrapper = mountFunc({
      propsData: {
        value: true,
        files: [
          { type: 'data-csv' },
          { type: 'data-xlsx' },
          { type: 'data-ods' }
        ]
      }
    })
    await flushPromises()
    const dlButtons = wrapper.findAll('.v-card__text button:not(.primary)')
    expect(dlButtons.length).toBe(3)
    expect(wrapper.emitted('generate')).toBeFalsy()
    await dlButtons.trigger('click')
    expect(dlSpy).toHaveBeenCalledTimes(3)
    expect(dlSpy.mock.calls).toEqual([['csv'], ['xlsx'], ['ods']])
  })
})
