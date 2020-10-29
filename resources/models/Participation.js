import { Model } from '@vuex-orm/core'
import { API_PREFIX } from '@/assets/js/endpoints'
export default class Participation extends Model {
  static entity = 'participations'
  static primaryKey = ['study_id', 'participant_id']

  static apiConfig = {
    baseURL: API_PREFIX
  }

  static fields () {
    return {
      study_id: this.attr(null),
      participant_id: this.attr(null),
      status_id: this.attr(null),
      priority: this.number(1),
      jobs_count: this.number(0),
      completed_jobs_count: this.number(0),
      created_at: this.attr(null),
      updated_at: this.attr(null)
    }
  }

  static async trend (config) {
    const reply = await this.api().get('/participations/trend', {
      ...config,
      save: false
    })
    return reply.response.data.data
  }

  static async mostRecent (config) {
    const reply = await this.api().get('/participations/most_recent', {
      ...config,
      save: false
    })
    return reply.response.data.data
  }

  static async mostActiveStudies (config) {
    const reply = await this.api().get('/participations/most_active_studies', {
      ...config,
      save: false
    })
    return reply.response.data.data
  }

  static async mostActiveParticipants (config) {
    const reply = await this.api().get('/participations/most_active_participants', {
      ...config,
      save: false
    })
    return reply.response.data.data
  }

  setPriority (priority, config) {
    const endpoint = `/participations/priority/${this.participant_id}/${this.study_id}`
    return this.constructor.api().patch(endpoint, { priority }, {
      ...config,
      save: false
    })
  }
}
