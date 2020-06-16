import pathify, { make } from 'vuex-pathify'
import VuexORM from '@vuex-orm/core'
import VuexORMAxios from '@vuex-orm/plugin-axios'

import User from '@/models/User'

VuexORM.use(VuexORMAxios)

const database = new VuexORM.Database()
database.register(User)

export const plugins = [
  pathify.plugin,
  VuexORM.install(database)
]

export const state = () => ({
  cookieWarningVisible: false,
  cookieWarningShown: false
})
export const mutations = make.mutations(state)

export const actions = {
  // async nuxtServerInit ({ commit, state }) {}
}
