import { Model } from '@vuex-orm/core'
import { PARTICIPATIONS } from '@/assets/js/endpoints'
export default class Participation extends Model {
  static entity = 'participations'
  static primaryKey = ['study_id', 'participant_id']

  static fields () {
    return {
      study_id: this.attr(null),
      participant_id: this.attr(null),
      status_id: this.attr(null),
      priority: this.number(1),
      jobs_count: this.number(0),
      job_results_count: this.number(0),
      created_at: this.attr(null),
      updated_at: this.attr(null)
    }
  }

  static async trend (config) {
    const reply = await this.api().get(`${PARTICIPATIONS}/trend`, {
      ...config,
      save: false
    })
    return reply.response.data.data
  }

  static async mostRecent (config) {
    const reply = await this.api().get(`${PARTICIPATIONS}/most_recent`, {
      ...config,
      save: false
    })
    return reply.response.data.data
  }

  static async mostActiveStudies (config) {
    const reply = await this.api().get(`${PARTICIPATIONS}/most_active_studies`, {
      ...config,
      save: false
    })
    return reply.response.data.data
  }

  static async mostActiveParticipants (config) {
    const reply = await this.api().get(`${PARTICIPATIONS}/most_active_participants`, {
      ...config,
      save: false
    })
    return reply.response.data.data
  }

  async setPriority (priority, config) {
    // Store old priority to reset it if an error occurs
    const oldPriority = this.priority
    // Already update the new priority locally
    this.$update({ priority })

    const endpoint = `${PARTICIPATIONS}/priority/${this.participant_id}/${this.study_id}`
    let response
    try {
      response = await this.constructor.api().patch(endpoint, { priority }, {
        ...config,
        save: false
      })
      return response
    } catch (e) {
      // Reset old priority value on error.
      this.$update({ priority: oldPriority })
      // Rethrow the error to let the calling component handle it.
      throw e
    }
  }
}
