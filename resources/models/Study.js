import { Model } from '@vuex-orm/core'

import User from './User'
import StudyUser from './StudyUser'
import Job from './Job'
import Variable from './Variable'

import { STUDIES } from '@/assets/js/endpoints'

export default class Study extends Model {
  static entity = 'studies'

  static apiConfig = {
    baseURL: STUDIES
  }

  static fetch (config) {
    return this.api().get('', config)
  }

  static fetchById (id, config) {
    return this.api().get(id, config)
  }

  static persist (data, config) {
    if (data.id) {
      return this.api().patch(`/${data.id}`, data, config)
    }
    return this.api().post('', data, config)
  }

  destroy (config) {
    return this.constructor.api().delete(`/${this.id}`, { delete: this.id, ...config })
  }

  static fields () {
    return {
      id: this.number(null),
      name: this.string(''),
      description: this.string(''),
      active: this.boolean(true),
      osexp_path: this.attr(''),
      created_at: this.attr(''),
      updated_at: this.attr(''),
      deleted_at: this.attr(''),
      participants_count: this.number(0),
      users: this.belongsToMany(User, StudyUser, 'study_id', 'user_id'),
      jobs: this.hasMany(Job, 'study_id'),
      variables: this.hasMany(Variable, 'study_id')
    }
  }
}
