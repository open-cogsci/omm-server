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
    return reply.response.data.data.trend
  }

  static async mostFrequent (config) {
    const reply = await this.api().get('/participations/mostfrequent', {
      ...config,
      save: false
    })
    return reply.response.data.data
  }
}
