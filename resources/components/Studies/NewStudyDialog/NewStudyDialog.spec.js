import Vuetify from 'vuetify'
import Vuex from 'vuex'
// import { Breakpoint } from 'vuetify/lib/services'
import { shallowMount, createLocalVue } from '@vue/test-utils'
import NewStudyDialog from './NewStudyDialog.vue'

const localVue = createLocalVue()
localVue.use(Vuex)

describe('NewStudyDialog', () => {
  let vuetify

  beforeEach(() => {
    vuetify = new Vuetify()
  })

  function mountFunc (options = {}) {
    return shallowMount(NewStudyDialog, {
      localVue,
      vuetify,
      propsData: {
        value: true
      },
      ...options
    })
  }

  test('is a Vue instance', () => {
    const wrapper = mountFunc()
    expect(wrapper.exists()).toBeTruthy()
  })
})
