import pathify, { make } from 'vuex-pathify'
import VuexORM from '@vuex-orm/core'
import VuexORMAxios from '@vuex-orm/plugin-axios'

import User from '@/models/User'
import Study from '@/models/Study'

VuexORM.use(VuexORMAxios, {
  dataKey: 'data'
})

const database = new VuexORM.Database()
database.register(User)
database.register(Study)

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
