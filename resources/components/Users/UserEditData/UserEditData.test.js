import Vuetify from 'vuetify'
import Vuex from 'vuex'
import axios from 'axios'
import faker from 'faker'

// import { Breakpoint } from 'vuetify/lib/services'
import { mount, createLocalVue } from '@vue/test-utils'
import { Model } from '@vuex-orm/core'
import flushPromises from 'flush-promises'
import UserEditData from './UserEditData.vue'
import * as storeIndex from '@/store'

jest.mock('axios')
Model.setAxios(axios)

const localVue = createLocalVue()
localVue.use(Vuex)

const user = { id: 1, name: 'User' }

const getSaveBtn = (wrapper) => {
  return wrapper.findAll('.v-card__actions .v-btn').at(1)
}

const getCancelBtn = (wrapper) => {
  return wrapper.findAll('.v-card__actions .v-btn').at(0)
}

describe('UserEditData', () => {
  let vuetify
  let login
  let actions
  let store
  let editUser

  beforeEach(() => {
    actions = {
      notify: jest.fn()
    }
    store = new Vuex.Store({
      ...storeIndex,
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
    axios.request.mockResolvedValue(response)
    editUser = {
      name: '',
      email: ''
    }
  })

  function mountFunc (options = {}) {
    return mount(UserEditData, {
      localVue,
      store,
      vuetify,
      mocks: {
        $auth: {
          login,
          user
        }
      },
      propsData: {
        user: editUser
      },
      stubs: ['nuxt-link'],
      ...options
    })
  }

  it('matches its snapshot', () => {
    const wrapper = mountFunc()
    expect(wrapper).toMatchSnapshot()
  })

  it('should set local data to the passed user props', async () => {
    const user = {
      name: faker.name.findName(),
      email: faker.internet.email(),
      user_type_id: 2,
      account_status: 'active'
    }
    const wrapper = mountFunc({ propsData: { user } })
    await flushPromises()
    expect(wrapper.vm.userData).toEqual(user)
  })

  it('checks if data is changed when cancelling and shows dialog if it is', async () => {
    const wrapper = mountFunc({
      propsData: {
        user: {
          name: faker.name.findName(),
          email: faker.internet.email(),
          user_type_id: 2,
          account_status: 'active'
        }
      }
    })
    await flushPromises()
    wrapper.vm.userData.name = 'Something different'
    const cancelBtn = getCancelBtn(wrapper)
    await cancelBtn.trigger('click')
    expect(wrapper.find('.v-dialog').exists()).toBe(true)
  })

  it('checks if data is changed when cancelling, and closes when no changes have been made', async () => {
    const wrapper = mountFunc({
      propsData: {
        user: {
          name: faker.name.findName(),
          email: faker.internet.email(),
          user_type_id: 2,
          account_status: 'active'
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
        user: {
          name: faker.name.findName(),
          email: faker.internet.email(),
          user_type_id: 2,
          account_status: 'active'
        }
      }
    })
    await flushPromises()
    expect(wrapper.emitted('clicked-save')).toBeFalsy()
    wrapper.vm.userData.name = 'Something different'
    const saveBtn = getSaveBtn(wrapper)
    expect(saveBtn.attributes('disabled')).toBeFalsy()
    await saveBtn.trigger('click')
    expect(wrapper.emitted('clicked-cancel')).toBeFalsy()
    expect(wrapper.emitted('clicked-save')).toBeTruthy()
  })

  it('should simply cancel if no changes have been made before clicking save', async () => {
    const wrapper = mountFunc({
      propsData: {
        user: {
          name: faker.name.findName(),
          email: faker.internet.email(),
          user_type_id: 2,
          account_status: 'active'
        }
      }
    })
    await flushPromises()
    expect(wrapper.emitted('clicked-save')).toBeFalsy()
    const saveBtn = getSaveBtn(wrapper)
    expect(saveBtn.attributes('disabled')).toBeFalsy()
    await saveBtn.trigger('click')
    expect(wrapper.emitted('clicked-save')).toBeFalsy()
    expect(wrapper.emitted('clicked-cancel')).toBeTruthy()
  })
})
