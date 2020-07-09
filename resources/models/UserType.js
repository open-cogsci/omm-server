import { Model } from '@vuex-orm/core'
// import User from './User'

export default class UserType extends Model {
  static entity = 'user_types'

  static fields () {
    return {
      id: this.attr(null),
      name: this.string('')
    }
  }
}
