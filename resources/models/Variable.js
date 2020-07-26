import { Model } from '@vuex-orm/core'

import Study from './Study'
import Job from './Job'
import JobVariable from './JobVariable'

export default class Variable extends Model {
  static entity = 'variables'

  static fields () {
    return {
      id: this.number(null),
      name: this.attr(''),
      study_id: this.number(null),
      created_at: this.attr(''),
      updated_at: this.attr(''),
      deleted_at: this.attr(''),
      study: this.belongsTo(Study, 'study_id'),
      jobs: this.belongsToMany(Job, JobVariable, 'variable_id', 'job_id')
    }
  }
}
