import { Model } from '@vuex-orm/core'

export default class UserType extends Model {
  static entity = 'user_types'

  static fields () {
    return {
      id: this.number(null),
      name: this.string('')
    }
  }
}
