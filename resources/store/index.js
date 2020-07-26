import pathify, { make } from 'vuex-pathify'
import VuexORM from '@vuex-orm/core'
import VuexORMAxios from '@vuex-orm/plugin-axios'

import User from '@/models/User'
import UserType from '@/models/UserType'
import Study from '@/models/Study'
import StudyUser from '@/models/StudyUser'
import Participant from '@/models/Participant'
import Job from '@/models/Job'
import JobVariable from '@/models/JobVariable'
import Variable from '@/models/Variable'

VuexORM.use(VuexORMAxios, {
  dataKey: 'data'
})

const database = new VuexORM.Database()
database.register(User)
database.register(UserType)
database.register(Study)
database.register(StudyUser)
database.register(Participant)
database.register(Job)
database.register(JobVariable)
database.register(Variable)

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
