import pathify, { make } from 'vuex-pathify'
import VuexORM from '@vuex-orm/core'
import VuexORMAxios from '@vuex-orm/plugin-axios'

import User from '@/models/User'
import UserType from '@/models/UserType'
import Study from '@/models/Study'
import StudyUser from '@/models/StudyUser'
import StudyFile from '@/models/StudyFile'
import Participant from '@/models/Participant'
import Participation from '@/models/Participation'
import Job from '@/models/Job'
import Variable from '@/models/Variable'
import Dtype from '@/models/Dtype'

VuexORM.use(VuexORMAxios, {
  dataKey: 'data'
})

const database = new VuexORM.Database()
database.register(User)
database.register(UserType)
database.register(Study)
database.register(StudyUser)
database.register(StudyFile)
database.register(Participant)
database.register(Participation)
database.register(Job)
database.register(Variable)
database.register(Dtype)

export const plugins = [
  pathify.plugin,
  VuexORM.install(database)
]

export const state = () => ({
  cookieWarningVisible: false,
  cookieWarningShown: false,
  studyTab: 0
})
export const mutations = make.mutations(state)
export const actions = {}
