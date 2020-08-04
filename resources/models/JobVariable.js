import { Model } from '@vuex-orm/core'
import { JOBS } from '~/assets/js/endpoints'

export default class JobVariable extends Model {
  static entity = 'job_variable'

  static primaryKey = ['job_id', 'variable_id']

  setValue (value, config) {
    return this.constructor.api().patch(
      `${JOBS}/${this.job_id}`,
      {
        variable_id: this.variable_id,
        value
      },
      config)
  }

  static fields () {
    return {
      job_id: this.number(null),
      variable_id: this.number(null),
      value: this.string('')
    }
  }
}
