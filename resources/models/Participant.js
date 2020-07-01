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
    return this.api().post('', data, config)
  }

  static fields () {
    return {
      id: this.number(null),
      name: this.string(''),
      rfid: this.string(''),
      active: this.boolean(true),
      created_at: this.attr(''),
      updated_at: this.attr(''),
      deleted_at: this.attr('')
      // user_type: this.belongsTo(UserType, 'user_type_id')
    }
  }
}
