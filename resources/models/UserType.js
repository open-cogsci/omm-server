import { Model } from '@vuex-orm/core'
import User from '@/models/User'

import { USERS } from '@/assets/js/endpoints'

export default class UserType extends Model {
  static entity = 'user_types'

  static fetch (config) {
    return this.api().get(`${USERS}/types`, config)
  }

  static fields () {
    return {
      id: this.attr(null),
      name: this.string(''),
      users: this.hasMany(User)
    }
  }
}
