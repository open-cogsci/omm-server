import pathify, { make } from 'vuex-pathify'

export const plugins = [pathify.plugin]

export const state = () => ({
  cookieWarningVisible: false,
  cookieWarningShown: false
})

export const mutations = make.mutations(state)

export const actions = {
  // async nuxtServerInit ({ commit, state }) {}
}
