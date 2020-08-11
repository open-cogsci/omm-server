import { Model } from '@vuex-orm/core'

import Study from './Study'
import Dtype from './Dtype'

export default class Variable extends Model {
  static entity = 'variables'

  static fields () {
    return {
      id: this.number(null),
      name: this.attr(''),
      study_id: this.number(null),
      dtype_id: this.number(null),
      created_at: this.attr(''),
      updated_at: this.attr(''),
      deleted_at: this.attr(''),
      dtype: this.belongsTo(Dtype, 'dtype_id'),
      study: this.belongsTo(Study, 'study_id')
    }
  }
}
