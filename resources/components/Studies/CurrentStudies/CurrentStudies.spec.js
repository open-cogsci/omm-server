import Vuetify from 'vuetify'
import Vuex from 'vuex'
import flushPromises from 'flush-promises'
import axios from 'axios'

// import { Breakpoint } from 'vuetify/lib/services'
import { mount, createLocalVue } from '@vue/test-utils'
import CurrentStudies from './CurrentStudies.vue'
import { STUDIES } from '@/assets/js/endpoints'

jest.mock('axios')

const localVue = createLocalVue()
localVue.use(Vuex)

describe('CurrentStudies', () => {
  let vuetify
  let store
  let actions

  beforeEach(() => {
    actions = {
      notify: jest.fn()
    }
    store = new Vuex.Store({
      state: {},
      modules: {
        notifications: {
          namespaced: true,
          state: {
            current: {},
            pending: []
          },
          actions
        }
      }
    })
    vuetify = new Vuetify()
    jest.resetAllMocks()

    // Make sure the fetch() function works for all tests
    const response = { data: { data: [] } }
    axios.get.mockResolvedValue(response)
  })

  function mountFunc (options = {}) {
    // Required for Vuetify's v-dialog to work correctly
    document.body.setAttribute('data-app', true)
    return mount(CurrentStudies, {
      localVue,
      vuetify,
      store,
      stubs: ['nuxt-link'],
      mocks: {
        $axios: axios
      },
      ...options
    })
  }

  test('Data is fetched after creation of component', () => {
    mountFunc()
    expect(axios.get).toHaveBeenCalledWith(STUDIES)
  })

  test('Should notify the user after an error occurs', async () => {
    jest.resetAllMocks()
    axios.get.mockRejectedValue({ response: { data: { error: { message: 'Error' } } } })
    // Notify should not have been called yet.
    expect(actions.notify).not.toHaveBeenCalled()
    mountFunc()
    await flushPromises()
    // Notify should have been called
    expect(actions.notify).toHaveBeenCalled()
  })

  test('Shows the new study dialog when indicated', async () => {
    const wrapper = mountFunc({
      data: () => ({ dialog: false })
    })
    let dialog = wrapper.find('.v-dialog__container')
    expect(dialog.exists()).toBe(true)
    expect(dialog.find('.v-card').exists()).toBe(false)
    await wrapper.setData({ dialog: true })
    dialog = wrapper.find('.v-dialog__container')
    expect(dialog.find('.v-card').exists()).toBe(true)
  })

  test('Sends data to the server', async () => {
    const wrapper = mountFunc()
    await flushPromises()
    // Compose the expected server response
    const study = { name: 'Boop', description: 'Beep' }
    const studyAddedId = { id: 1, ...study }
    const response = { data: { data: studyAddedId } }
    // ... and mock it
    axios.post.mockResolvedValue(response)
    // The saving indicator should be hidden at first.
    expect(wrapper.vm.saving).toBe(false)
    // Save the study
    wrapper.vm.saveNewStudy(study)
    // Check if saving indicator is active
    expect(wrapper.vm.saving).toBe(true)
    await flushPromises()
    // After the operation is complete, the saving indicator should be deactivated
    expect(wrapper.vm.saving).toBe(false)
    // The studies array should now contain the saved study
    expect(wrapper.vm.studies).toContain(studyAddedId)
  })

  test('In case of an error, the user should be notified', async () => {
    const wrapper = mountFunc()
    await flushPromises()
    axios.post.mockRejectedValue({ response: { data: { error: { message: 'Error' } } } })
    // Notify should not have been called yet
    expect(actions.notify).not.toHaveBeenCalled()
    // The buttons saving indicator should be hidden at first.
    expect(wrapper.vm.saving).toBe(false)
    wrapper.vm.saveNewStudy({ name: 'Boop', description: 'Beep' })
    expect(wrapper.vm.saving).toBe(true)
    await flushPromises()
    expect(wrapper.vm.saving).toBe(false)
    expect(actions.notify).toHaveBeenCalled()
  })

  test('Errors should be reset after the dialog closes', async () => {
    const errors = { name: 'Invalid', description: 'Required' }
    const wrapper = mountFunc({
      data () {
        return { errors }
      }
    })
    await flushPromises()
    expect(wrapper.vm.errors).toEqual(errors)
    wrapper.vm.clearErrors(false)
    expect(wrapper.vm.errors).toEqual({ name: '', description: '' })
  })

  test('Errors should not be reset if a dialog hasn not closed', async () => {
    const errors = { name: 'Invalid', description: 'Required' }
    const wrapper = mountFunc({
      data () {
        return { errors }
      }
    })
    await flushPromises()
    expect(wrapper.vm.errors).toEqual(errors)
    wrapper.vm.clearErrors(true)
    expect(wrapper.vm.errors).toEqual(errors)
  })
})
