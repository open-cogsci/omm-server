import Vuetify from 'vuetify'
import { mount, createLocalVue } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import LanguageSwitcher from './LanguageSwitcher.vue'

const localVue = createLocalVue()

describe('LanguageSwitcher', () => {
  let vuetify

  beforeAll(() => {
    vuetify = new Vuetify()
  })

  beforeEach(() => {
    jest.resetAllMocks()
  })

  function mountFunc (options = {}) {
    return mount(LanguageSwitcher, {
      localVue,
      vuetify,
      stubs: ['nuxt-link'],
      mocks: {
        $i18n: {
          locale: 'en'
        },
        $router: {
          push: jest.fn()
        },
        switchLocalePath: jest.fn()
      },
      ...options
    })
  }

  it('should display correct country depending on current locale', async () => {
    const wrapper = mountFunc()
    await flushPromises()
    const currentLocaleButton = wrapper.find('.v-list > .v-list-item')
    const localeDiv = currentLocaleButton.find('.v-list-item__content')

    expect(localeDiv.text()).toBe('English')
    wrapper.vm.$i18n.locale = 'fr'
    await flushPromises()
    expect(localeDiv.text()).toBe('Français')
    wrapper.vm.$i18n.locale = 'nl'
    await flushPromises()
    expect(localeDiv.text()).toBe('Nederlands')
  })

  it('should correctly switch locales', async () => {
    const wrapper = mountFunc()
    await flushPromises()
    const newLocale = 'fr'
    wrapper.vm.currentLocale = newLocale
    await flushPromises()
    expect(wrapper.vm.switchLocalePath).toHaveBeenCalledWith(newLocale)
    expect(wrapper.vm.$router.push).toHaveBeenCalled()
    expect(wrapper.emitted('switched-locale')[0]).toEqual([newLocale])
  })

  it('should show the menu when clicked', async () => {
    const wrapper = mountFunc()
    await flushPromises()
    expect(wrapper.find('.v-menu__content').exists()).toBe(false)
    const currentLocaleButton = wrapper.find('.v-list > .v-list-item')
    await currentLocaleButton.trigger('click')
    await flushPromises()
    const menu = wrapper.find('.v-menu__content')
    expect(menu.exists()).toBe(true)
    const langs = menu.findAll('.v-list-item--link')
    // Expect the number of menu items to be equal to number of items in data
    expect(langs.length).toBe(Object.keys(wrapper.vm.items).length)
  })

  it('should change the locale depending on menu item click', async () => {
    const wrapper = mountFunc()
    await flushPromises()
    const currentLocaleButton = wrapper.find('.v-list > .v-list-item')
    await currentLocaleButton.trigger('click')
    await flushPromises()
    const menu = wrapper.find('.v-menu__content')
    const langs = menu.findAll('.v-list-item--link')
    const clickedLang = langs.at(0)
    await clickedLang.trigger('click')
    expect(wrapper.emitted('switched-locale')[0]).toEqual([clickedLang.vm.value])
  })
})
