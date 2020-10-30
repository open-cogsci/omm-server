
import Vuetify from 'vuetify'
import { mount, createLocalVue } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import componentToTest from './SaveCancelIconButtons.vue'
import { FragmentWrapper } from '@/test/util'

const localVue = createLocalVue()

describe(`${componentToTest}`, () => {
  let vuetify

  beforeAll(() => {
    vuetify = new Vuetify()
  })

  beforeEach(() => {
    jest.resetAllMocks()
  })

  async function mountFunc (options = {}) {
    const wrapper = mount(FragmentWrapper(componentToTest), {
      localVue,
      vuetify,
      mocks: {},
      propsData: {},
      ...options
    })
    await flushPromises()
    return wrapper.findComponent(componentToTest)
  }

  it('should match its snapshot', async () => {
    const wrapper = mountFunc()
    await flushPromises()
    expect(wrapper).toMatchSnapshot()
  })

  it('should correct events when clicked', async () => {
    const wrapper = await mountFunc()
    const btns = wrapper.findAll('.v-icon')
    expect(wrapper.emitted('clicked-cancel')).toBeFalsy()
    await btns.at(1).trigger('click')
    expect(wrapper.emitted('clicked-cancel')).toBeTruthy()
    expect(wrapper.emitted('clicked-save')).toBeFalsy()
    await btns.at(0).trigger('click')
    expect(wrapper.emitted('clicked-save')).toBeTruthy()
  })
})
