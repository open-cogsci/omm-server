import Vuetify from 'vuetify'
import { mount, createLocalVue } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import ParticipantEditData from './ParticipantEditData.vue'

const localVue = createLocalVue()

describe('ParticipantEditData wrapper', () => {
  let vuetify
  let login

  beforeEach(() => {
    vuetify = new Vuetify()
    login = jest.fn()
  })

  function mountFunc (options = {}) {
    return mount(ParticipantEditData, {
      localVue,
      vuetify,
      mocks: {
        $auth: {
          login,
          user: null
        }
      },
      stubs: ['nuxt-link'],
      ...options
    })
  }

  it('matches its snapshot', () => {
    const wrapper = mountFunc()
    expect(wrapper).toMatchSnapshot()
  })

  it('checks if data is changed upon saving', async () => {
    const wrapper = mountFunc()
    await flushPromises()
    const saveBtn = wrapper.findAll('.v-card__actions .v-btn')
    await saveBtn.trigger('click')
  })
})
