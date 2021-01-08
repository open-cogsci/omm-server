import { Model } from '@vuex-orm/core'
import { USERS, SET_LOCALE, RESEND_VERIFICATION } from '@/assets/js/endpoints'
import UserType from './UserType'
import Study from './Study'
import StudyUser from './StudyUser'

export default class User extends Model {
  static entity = 'users'

  static fields () {
    return {
      id: this.attr(null),
      user_type_id: this.attr(null),
      user_type: this.belongsTo(UserType, 'user_type_id'),
      name: this.string(''),
      email: this.string(''),
      password: this.string(''),
      account_status: this.attr(''),
      last_login: this.attr(''),
      created_at: this.attr(''),
      updated_at: this.attr(''),
      deleted_at: this.attr(''),
      studies_count: this.number(null),
      studies: this.belongsToMany(Study, StudyUser, 'user_id', 'study_id')
    }
  }

  static async fetch (config) {
    const reply = await this.api().get(USERS, config)
    const pagination = reply.response.data.pagination
    pagination.ids = reply.entities.users?.map(entity => entity.id) || []
    return pagination
  }

  static fetchById (id, config) {
    return this.api().get(`${USERS}/${id}`, config)
  }

  static persist (data, config) {
    if (data.id) {
      return this.api().patch(`${USERS}/${data.id}`, data, config)
    }
    return this.api().post(USERS, data, config)
  }

  static async search (term, config) {
    if (!term || term.length < 3) { return [] }
    const results = await this.api().post(`${USERS}/search`, { term },
      {
        save: false,
        ...config
      })
    return results.response.data?.data || []
  }

  static setLocale (locale, config) {
    return this.api().patch(SET_LOCALE, { locale }, {
      ...config,
      save: false
    })
  }

  resendAccountEmail (config) {
    return this.constructor.api().post(`${USERS}/resend_account_email`, { id: this.id }, {
      save: false,
      ...config
    })
  }

  resendActivationEmail (config) {
    return this.constructor.api().post(RESEND_VERIFICATION, { id: this.id }, {
      ...config,
      save: false
    })
  }

  destroy (config) {
    return this.constructor.api().delete(`${USERS}/${this.id}`, { delete: this.id, ...config })
  }

  get isAdmin () {
    return this.user_type_id === 1
  }
}
