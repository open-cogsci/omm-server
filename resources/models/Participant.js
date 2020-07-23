import { Model } from '@vuex-orm/core'
import { PARTICIPANTS } from '@/assets/js/endpoints'

export default class Participant extends Model {
  static entity = 'participants'

  static apiConfig = {
    baseURL: PARTICIPANTS
  }

  static fetch (config) {
    return this.api().get('', config)
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

  static fields () {
    return {
      id: this.number(null),
      name: this.string(''),
      identifier: this.string(''),
      active: this.boolean(true),
      studies_count: this.number(null),
      created_at: this.attr(''),
      updated_at: this.attr(''),
      deleted_at: this.attr('')
    }
  }
}
