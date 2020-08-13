import { Model } from '@vuex-orm/core'

export default class Participation extends Model {
  static entity = 'participations'

  static primaryKey = ['study_id', 'participant_id']

  static fields () {
    return {
      study_id: this.attr(null),
      participant_id: this.attr(null),
      status_id: this.attr(null),
      created_at: this.attr(null),
      updated_at: this.attr(null)
    }
  }
}
