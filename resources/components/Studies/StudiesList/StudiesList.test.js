import Vuetify from 'vuetify'
// import { Breakpoint } from 'vuetify/lib/services'
import { mount, createLocalVue } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import StudiesList from './StudiesList.vue'

jest.mock('axios')
const localVue = createLocalVue()

describe('StudiesList', () => {
  let vuetify
  beforeEach(() => {
    vuetify = new Vuetify()
    jest.resetAllMocks()
  })

  function mountFunc (options = {}) {
    return mount(StudiesList, {
      localVue,
      vuetify,
      stubs: ['nuxt-link'],
      ...options
    })
  }

  // test('Data is shown', async () => {
  //   // Test is skipped because the v-virtual-scroll component of vuetify doesn't render any items
  //   // offscreen. I have yet to find out how to force it to.
  //   const studies = [
  //     { id: 1, name: 'Test study', description: 'Description' },
  //     { id: 2, name: 'Test study 2', description: 'Description', to: '/studies/2' }
  //   ]
  //   const wrapper = mountFunc({
  //     propsData: { studies }
  //   })

  //   await flushPromises()
  //   // Expect a list item to be created
  //   const listItem = wrapper.find('.v-list-item')
  //   expect(listItem.exists()).toBe(true)

  //   // Expect a list item title to be same as study name
  //   expect(listItem.find('.v-list-item__title').text()).toBe(studies[0].name)
  //   // Expect a list item description to be the same as study name
  //   expect(listItem.find('.v-list-item__subtitle').text()).toBe(studies[0].description)

  //   // Expect the found the same amount of list items as passed studies
  //   expect(wrapper.findAll('.v-list-item').length).toBe(studies.length)
  // })

  test('Shows new study button and processes clicks on it', async () => {
    const wrapper = mountFunc({
      propsData: {
        studies: [],
        addStudyButton: false
      }
    })
    await flushPromises()
    expect(wrapper.find('.v-list-item.success').exists()).toBe(false)
    await wrapper.setProps({ addStudyButton: true })

    // Check if the button exists and contains the right text
    const addStudyButton = wrapper.find('.v-list-item.success')
    expect(addStudyButton.exists()).toBe(true)
    expect(addStudyButton.find('.v-list-item__title').text()).toBe('studies.list.add')
    // Check if a click on the button emits the required event
    await addStudyButton.trigger('click')
    expect(wrapper.emitted()['clicked-new-study']).toBeTruthy()
  })
})
