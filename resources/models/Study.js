import { Model } from '@vuex-orm/core'
import { STUDIES } from '@/assets/js/endpoints'

export default class Study extends Model {
  static entity = 'studies'

  static apiConfig = {
    baseURL: STUDIES
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
      description: this.string(''),
      active: this.boolean(true),
      created_at: this.attr(''),
      updated_at: this.attr(''),
      deleted_at: this.attr('')
      // user_type: this.belongsTo(UserType, 'user_type_id')
    }
  }
}
