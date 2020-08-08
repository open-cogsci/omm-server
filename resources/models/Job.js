import { Model } from '@vuex-orm/core'

import Study from './Study'
// import Variable from './Variable'
// import JobVariable from './JobVariable'

import { JOBS } from '@/assets/js/endpoints'

export default class Job extends Model {
  static entity = 'jobs'

  static apiConfig = {
    baseURL: JOBS
  }

  static fetchById (id, config) {
    return this.api().get(id, config)
  }

  static persist (data, config) {
    if (data.id) {
      return this.api().patch(`/${data.id}`, data, config)
    }
    return this.api().post('', data, config)
  }

  destroy (config) {
    return this.constructor.api().delete(`/${this.id}`, { delete: this.id, ...config })
  }

  moveTo (newPosition, config) {
    return this.constructor.api().patch(`/${this.id}/move/${newPosition}`, config)
  }

  static fields () {
    return {
      id: this.number(null),
      position: this.number(''),
      study_id: this.number(null),
      created_at: this.attr(''),
      updated_at: this.attr(''),
      deleted_at: this.attr(''),
      study: this.belongsTo(Study, 'study_id'),
      variables: this.attr([])
    }
  }
}
