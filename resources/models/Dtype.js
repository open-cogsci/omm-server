import { Model } from '@vuex-orm/core'

import Variable from './Variable'

export default class Dtype extends Model {
  static entity = 'dtypes'

  static fields () {
    return {
      id: this.attr(''),
      name: this.attr(''),
      variables: this.hasMany(Variable, 'dtype_id')
    }
  }
}
