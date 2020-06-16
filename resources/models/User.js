import { Model } from '@vuex-orm/core'

export default class User extends Model {
  static entity = 'users'

  static fields () {
    return {
      id: this.number(null),
      user_type_id: this.number(null),
      name: this.string(''),
      email: this.string(''),
      created_at: this.attr(''),
      updated_at: this.attr(''),
      deleted_at: this.attr('')

      // user_type: this.belongsTo(UserType, 'user_type_id')
    }
  }
}
