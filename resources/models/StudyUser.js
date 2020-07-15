import { Model } from '@vuex-orm/core'

export default class StudyUser extends Model {
  static entity = 'study_user'

  static primaryKey = ['study_id', 'user_id']

  static fields () {
    return {
      study_id: this.attr(null),
      user_id: this.attr(null),
      is_owner: this.boolean(null),
      access_permission_id: this.attr(null)
    }
  }
}
