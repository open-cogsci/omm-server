import { Model } from '@vuex-orm/core'
import Participation from './Participation'
import Study from './Study'

import { PARTICIPANTS } from '@/assets/js/endpoints'

export default class Participant extends Model {
  static entity = 'participants'

  static apiConfig = {
    baseURL: PARTICIPANTS
  }

  static fields () {
    return {
      id: this.number(null),
      name: this.string(''),
      identifier: this.string(''),
      active: this.boolean(true),
      studies_count: this.number(0),
      completed_jobs_count: this.number(0),
      created_at: this.attr(''),
      updated_at: this.attr(''),
      deleted_at: this.attr(''),
      studies: this.belongsToMany(Study, Participation, 'participant_id', 'study_id')
    }
  }

  static async fetch (config) {
    const reply = await this.api().get('', config)
    if (!reply.response.data.pagination) {
      return reply
    }
    const pagination = reply.response.data.pagination
    pagination.ids = reply.entities.participants?.map(entity => entity.id) || []
    return pagination
  }

  static fetchById (id, config) {
    return this.api().get(`/${id}`, config)
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
}
