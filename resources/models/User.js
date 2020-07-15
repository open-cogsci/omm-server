import { Model } from '@vuex-orm/core'
import UserType from './UserType'
import Study from './Study'
import StudyUser from './StudyUser'
import { USERS } from '@/assets/js/endpoints'

export default class User extends Model {
  static entity = 'users'

  static apiConfig = {
    baseURL: USERS
  }

  static fetch (config) {
    return this.api().get('', config)
  }

  static fetchById (id, config) {
    return this.api().get(`/${id}`, config)
  }

  static persist (data, config) {
    if (data.id) {
      return this.api().patch(`/${data.id}`, data, config)
    }
    return this.api().post('', data, config)
  }

  static destroy (id, config) {
    return this.api().delete(`/${id}`, { delete: id, ...config })
  }

  get isAdmin () {
    return this.user_type_id === 1
  }

  static fields () {
    return {
      id: this.attr(null),
      user_type_id: this.attr(null),
      user_type: this.belongsTo(UserType, 'user_type_id'),
      name: this.string(''),
      email: this.string(''),
      password: this.string(''),
      active: this.boolean(null),
      created_at: this.attr(''),
      updated_at: this.attr(''),
      deleted_at: this.attr(''),
      studies_count: this.number(null),
      studies: this.belongsToMany(Study, StudyUser, 'user_id', 'study_id')
    }
  }
}
