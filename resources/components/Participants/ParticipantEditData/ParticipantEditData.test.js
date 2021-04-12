import Vuetify from 'vuetify'
import { mount, createLocalVue } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import faker from 'faker'
import ParticipantEditData from './ParticipantEditData.vue'

const localVue = createLocalVue()

const getSaveBtn = (wrapper) => {
  return wrapper.findAll('.v-card__actions .v-btn').at(1)
}

const getCancelBtn = (wrapper) => {
  return wrapper.findAll('.v-card__actions .v-btn').at(0)
}

describe('ParticipantEditData', () => {
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

  it('checks if local data matches props', async () => {
    const participant = {
      name: faker.name.findName(),
      identifier: faker.git.shortSha(),
      active: true
    }
    const wrapper = mountFunc({ propsData: { participant } })
    await flushPromises()
    expect(wrapper.vm.ptcp).toEqual(participant)
  })

  it('checks if data is changed when cancelling and shows dialog if it is', async () => {
    const wrapper = mountFunc({
      propsData: {
        participant: {
          name: faker.name.findName(),
          identifier: faker.git.shortSha(),
          active: true
        }
      }
    })
    await flushPromises()
    wrapper.vm.ptcp.name = 'Something different'
    const cancelBtn = getCancelBtn(wrapper)
    await cancelBtn.trigger('click')
    expect(wrapper.find('.v-dialog').exists()).toBe(true)
  })

  it('checks if data is changed when cancelling, and closes when no changes have been made', async () => {
    const wrapper = mountFunc({
      propsData: {
        participant: {
          name: faker.name.findName(),
          identifier: faker.git.shortSha(),
          active: true
        }
      }
    })
    await flushPromises()
    expect(wrapper.emitted('clicked-cancel')).toBeFalsy()
    const cancelBtn = getCancelBtn(wrapper)
    await cancelBtn.trigger('click')
    expect(wrapper.find('.v-dialog').exists()).toBe(false)
    expect(wrapper.emitted('clicked-cancel')).toBeTruthy()
  })

  it('should save changes', async () => {
    const wrapper = mountFunc({
      propsData: {
        participant: {
          name: faker.name.findName(),
          identifier: faker.git.shortSha(),
          active: true
        }
      }
    })
    await flushPromises()
    expect(wrapper.emitted('clicked-save')).toBeFalsy()
    wrapper.vm.ptcp.name = 'Something different'
    const saveBtn = getSaveBtn(wrapper)
    expect(saveBtn.attributes('disabled')).toBeFalsy()
    await saveBtn.trigger('click')
    expect(wrapper.emitted('clicked-cancel')).toBeFalsy()
    expect(wrapper.emitted('clicked-save')).toBeTruthy()
  })

  it('should simply cancel if no changes have been made before clicking save', async () => {
    const wrapper = mountFunc({
      propsData: {
        participant: {
          name: faker.name.findName(),
          identifier: faker.git.shortSha(),
          active: true
        }
      }
    })
    await flushPromises()
    expect(wrapper.emitted('clicked-save')).toBeFalsy()
    const saveBtn = getSaveBtn(wrapper)
    expect(saveBtn.attributes('disabled')).toBeFalsy()
    await saveBtn.trigger('click')
    expect(wrapper.emitted('clicked-cancel')).toBeTruthy()
    expect(wrapper.emitted('clicked-save')).toBeFalsy()
  })
})
