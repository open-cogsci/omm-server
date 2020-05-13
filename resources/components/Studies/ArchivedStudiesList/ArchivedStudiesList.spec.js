import Vuetify from 'vuetify'
// import { Breakpoint } from 'vuetify/lib/services'
import { shallowMount, createLocalVue } from '@vue/test-utils'
import moxios from 'moxios'
import ArchivedStudiesList from './ArchivedStudiesList.vue'
import { STUDIES } from '@/assets/js/endpoints'

const localVue = createLocalVue()

describe('ArchivedStudiesList', () => {
  let vuetify
  // const opts = {}

  beforeEach(() => {
    vuetify = new Vuetify({
      mocks: {
        $vuetify: {
          breakpoint: {}
        }
      }
    })
    moxios.install()
  })

  afterEach(function () {
    // import and pass your custom axios instance to this method
    moxios.uninstall()
  })

  function mountFunc (options = {}) {
    return shallowMount(ArchivedStudiesList, {
      localVue,
      vuetify,
      ...options
    })
  }

  test('is a Vue instance', () => {
    const wrapper = mountFunc()
    expect(wrapper.exists()).toBeTruthy()
  })

  test('Fetch has been called after', () => {
    moxios.stubRequest(STUDIES, {
      status: 200,
      response: {
        data: [
          { id: 1, name: 'Test study', description: 'Description' }
        ]
      }
    })

    const wrapper = mountFunc()
    expect(wrapper.exists()).toBeTruthy()
  })
})
