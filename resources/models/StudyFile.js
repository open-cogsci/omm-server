import { Model } from '@vuex-orm/core'

import Study from './Study'

export default class StudyFile extends Model {
  static entity = 'files'

  static fields () {
    return {
      id: this.number(null),
      study_id: this.number(null),
      study: this.belongsTo(Study, 'study_id'),
      path: this.attr(''),
      filename: this.attr(''),
      type: this.attr('')
    }
  }
}
