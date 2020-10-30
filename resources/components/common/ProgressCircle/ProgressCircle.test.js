import Vuetify from 'vuetify'
import { mount, createLocalVue } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import ProgressCircle from './ProgressCircle.vue'

const localVue = createLocalVue()

describe('ProgressCircle', () => {
  let vuetify

  beforeAll(() => {
    vuetify = new Vuetify()
  })

  beforeEach(() => {
    jest.resetAllMocks()
  })

  function mountFunc (options = {}) {
    return mount(ProgressCircle, {
      localVue,
      vuetify,
      mocks: {},
      propsData: {
        value: 100
      },
      ...options
    })
  }

  it('should match its snapshot', async () => {
    const wrapper = mountFunc()
    await flushPromises()
    expect(wrapper).toMatchSnapshot()
  })

  it('should show correct color depending on value', async () => {
    const wrapper = mountFunc({
      propsData: {
        value: 80
      }
    })
    await flushPromises()
    const progress = wrapper.find('.v-progress-circular')
    expect(progress.classes()).toContain('green--text')
    await wrapper.setProps({ value: 10 })
    expect(progress.classes()).toContain('primary--text')
    await wrapper.setProps({ value: 60 })
    expect(progress.classes()).toContain('green--text')
    expect(progress.classes()).toContain('text--darken-2')
  })
})
