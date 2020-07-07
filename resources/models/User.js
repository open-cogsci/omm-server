import { Model } from '@vuex-orm/core'
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
    return this.api().get(id, config)
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

  static fields () {
    return {
      id: this.number(null),
      user_type_id: this.number(null),
      name: this.string(''),
      email: this.string(''),
      active: this.boolean(null),
      studies_count: this.number(null),
      created_at: this.attr(''),
      updated_at: this.attr(''),
      deleted_at: this.attr('')

      // user_type: this.belongsTo(UserType, 'user_type_id')
    }
  }
}
