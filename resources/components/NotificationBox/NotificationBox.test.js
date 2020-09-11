import Vuetify from 'vuetify'
import Vuex from 'vuex'
import { mount, createLocalVue } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import NotificationBox from './NotificationBox.vue'
import { state, mutations, actions } from '@/store/notifications'

const localVue = createLocalVue()
localVue.use(Vuex)

function freshStore () {
  return {
    state,
    modules: {
      notifications: {
        namespaced: true,
        state,
        mutations,
        actions
      }
    }
  }
}

describe('NotificationBox', () => {
  let vuetify
  let store

  // const opts = {}

  beforeEach(() => {
    store = new Vuex.Store(freshStore())
    vuetify = new Vuetify({
      mocks: {
        $vuetify: {
          breakpoint: {}
        }
      }
    })
  })

  function mountFunc (options = {}) {
    return mount(NotificationBox, {
      store,
      localVue,
      vuetify,
      ...options
    })
  }

  it('should match its snapshot', async () => {
    const wrapper = mountFunc()
    await flushPromises()
    expect(wrapper).toMatchSnapshot()
  })

  it('should pop the next notification when button is clicked', async () => {
    const storeContents = freshStore()
    const popMock = jest.fn()
    storeContents.modules.notifications.actions.pop = popMock
    store = new Vuex.Store(storeContents)
    const wrapper = mountFunc({ store })
    await flushPromises()
    const btn = wrapper.find('.v-btn')
    await btn.trigger('click')
    expect(popMock).toHaveBeenCalled()
  })
})
