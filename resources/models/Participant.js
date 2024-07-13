import { Model } from '@vuex-orm/core'
import Participation from './Participation'
import Study from './Study'
import { PARTICIPANTS } from '@/assets/js/endpoints'

export default class Participant extends Model {
  static entity = 'participants'

  static fields () {
    return {
      id: this.number(null),
      name: this.string(''),
      identifier: this.string(''),
      alternate_identifier: this.string(null),
      active: this.boolean(true),
      meta: this.attr(''),
      studies_count: this.number(0),
      created_at: this.attr(''),
      updated_at: this.attr(''),
      deleted_at: this.attr(''),
      studies: this.belongsToMany(Study, Participation, 'participant_id', 'study_id')
    }
  }

  static async fetch (config) {
    const reply = await this.api().get(PARTICIPANTS, config)
    if (!reply.response.data.pagination) {
      return reply
    }
    const pagination = reply.response.data.pagination
    pagination.ids = reply.entities.participants?.map(entity => entity.id) || []
    return pagination
  }

  static fetchById (id, config) {
    return this.api().get(`${PARTICIPANTS}/${id}`, config)
  }

  static persist (data, config) {
    if (data.id) {
      return this.api().patch(`${PARTICIPANTS}/${data.id}`, data, config)
    }
    return this.api().post(PARTICIPANTS, data, config)
  }

  destroy (config) {
    return this.constructor.api().delete(`${PARTICIPANTS}/${this.id}`, { delete: this.id, ...config })
  }
}
