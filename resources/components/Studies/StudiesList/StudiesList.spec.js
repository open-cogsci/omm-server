import Vuetify from 'vuetify'
// import { Breakpoint } from 'vuetify/lib/services'
import { mount, createLocalVue } from '@vue/test-utils'
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

  test('Data is shown', () => {
    const studies = [
      { id: 1, name: 'Test study', description: 'Description' },
      { id: 2, name: 'Test study 2', description: 'Description', to: '/studies/2' }
    ]
    const wrapper = mountFunc({
      propsData: { studies }
    })

    // Expect a list item to be created
    const listItem = wrapper.find('.v-list-item')
    expect(listItem.exists()).toBe(true)

    // Expect a list item title to be same as study name
    expect(listItem.find('.v-list-item__title').text()).toBe(studies[0].name)
    // Expect a list item description to be the same as study name
    expect(listItem.find('.v-list-item__subtitle').text()).toBe(studies[0].description)

    // Expect the found the same amount of list items as passed studies
    expect(wrapper.findAll('.v-list-item').length).toBe(studies.length)
  })

  test('Skeleton is shown during loading and hidden afterwards', async () => {
    const wrapper = mountFunc({
      propsData: {
        studies: [],
        loading: true
      }
    })
    expect(wrapper.find('.v-skeleton-loader').exists()).toBe(true)
    expect(wrapper.find('.v-list-item').exists()).toBe(false)

    await wrapper.setProps({
      studies: [{ id: 1, name: 'Test study', description: 'Description' }],
      loading: false
    })
    expect(wrapper.find('.v-skeleton-loader').exists()).toBe(false)
    expect(wrapper.find('.v-list-item').exists()).toBe(true)
  })

  test('Shows new study button and processes clicks on it', async () => {
    const wrapper = mountFunc({
      propsData: {
        studies: [],
        addStudyButton: true
      }
    })
    // Check if the button exists and contains the right text
    const addStudyButton = wrapper.find('.v-list-item.success')
    expect(addStudyButton.exists()).toBe(true)
    expect(addStudyButton.find('.v-list-item__title').text()).toBe('Add a new study')
    // Check if a click on the button emits the required event
    await addStudyButton.trigger('click')
    expect(wrapper.emitted()['clicked-new-study']).toBeTruthy()
  })
})
