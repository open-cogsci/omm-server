import { Model } from '@vuex-orm/core'

import Study from './Study'
import Job from './Job'
import JobVariable from './JobVariable'
import Dtype from './Dtype'

export default class Variable extends Model {
  static entity = 'variables'

  value (jobID) {
    return JobVariable.find([jobID, this.id])
  }

  static fields () {
    return {
      id: this.attr(''),
      name: this.attr(''),
      study_id: this.attr(''),
      dtype_id: this.attr(''),
      created_at: this.attr(''),
      updated_at: this.attr(''),
      deleted_at: this.attr(''),
      dtype: this.belongsTo(Dtype, 'dtype_id'),
      study: this.belongsTo(Study, 'study_id'),
      jobs: this.belongsToMany(Job, JobVariable, 'variable_id', 'job_id')
    }
  }
}
