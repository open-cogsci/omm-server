import { Model } from '@vuex-orm/core'

export default class JobVariable extends Model {
  static entity = 'job_variable'

  static primaryKey = ['job_id', 'variable_id']

  static fields () {
    return {
      job_id: this.number(null),
      variable_id: this.number(null),
      value: this.string('')
    }
  }
}
