import { Model } from '@vuex-orm/core'
import keyBy from 'lodash/keyBy'
import User from './User'
import StudyUser from './StudyUser'
import Job from './Job'
import Variable from './Variable'
import StudyFile from './StudyFile'
import Participant from './Participant'
import Participation from './Participation'

import { STUDIES } from '@/assets/js/endpoints'

export const jobTransformer = ({ data }) => {
  const study = data.data
  if (study.jobs?.length) {
    study.jobs = study.jobs.map((job) => {
      job.variables = keyBy(job.variables, 'name')
      return job
    })
  }
  return study
}

export default class Study extends Model {
  static entity = 'studies'

  static apiConfig = {
    baseURL: STUDIES
  }

  static fields () {
    return {
      id: this.attr(''),
      name: this.string(''),
      description: this.string(''),
      active: this.boolean(true),
      created_at: this.attr(''),
      updated_at: this.attr(''),
      deleted_at: this.attr(''),
      participants_count: this.number(0),
      jobs_count: this.number(0),
      completed_jobs_count: this.number(0),
      users: this.belongsToMany(User, StudyUser, 'study_id', 'user_id'),
      jobs: this.hasMany(Job, 'study_id'),
      variables: this.hasMany(Variable, 'study_id'),
      files: this.hasMany(StudyFile, 'study_id'),
      participants: this.belongsToMany(Participant, Participation, 'study_id', 'participant_id')
    }
  }

  /**
   * Fetch studies
   *
   * @static
   * @param {Object} config
   * @returns {Promise}
   * @memberof Study
   */
  static fetch (config) {
    return this.api().get('', config)
  }

  /**
   * Fetch study by ID
   *
   * @static
   * @param {Number} id
   * @param {Object} config
   * @returns {Object}
   * @memberof Study
   */
  static fetchById (id, config) {
    return this.api().get(id, {
      dataTransformer: jobTransformer,
      ...config
    })
  }

  /**
   * Creates or updates a study record
   *
   * @static
   * @param {Object} data
   * @param {Object} config
   * @returns {Promise}
   * @memberof Study
   */
  static persist (data, config) {
    if (data.id) {
      return this.api().patch(`/${data.id}`, data, config)
    }
    return this.api().post('', data, config)
  }

  /**
   * Deletes a study record
   *
   * @param {Object} config
   * @returns {Promise}
   * @memberof Study
   */
  destroy (config) {
    return this.constructor.api().delete(`/${this.id}`, { delete: this.id, ...config })
  }

  /**
   * Archives or unarchives a study
   *
   * @param {*} config
   * @returns
   * @memberof Study
   */
  toggleArchived (config) {
    return this.constructor.api().patch(`/${this.id}/archive`, config)
  }

  /**
   * Uploads a study file
   *
   * @param {String} type jobs or experiment
   * @param {File} file
   * @param {Object} config
   * @returns {Promise}
   * @memberof Study
   */
  upload (type, file, config) {
    const formData = new FormData()
    formData.append('payload', file)
    formData.append('type', type)
    return this.constructor.api().post(
      `/${this.id}/upload/${type}`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        persistOptions: {
          create: ['files']
        },
        ...config
      }
    )
  }

  /**
   * Refresh jobs from the server
   *
   * @param {Object} config
   * @returns {Promise}
   * @memberof Study
   */
  refreshJobs (config) {
    return this.constructor.api().get(`${this.id}/jobs/refresh`, {
      dataTransformer: jobTransformer,
      persistOptions: {
        create: ['jobs', 'variables']
      },
      ...config
    })
  }

  /**
   * Add collaborator to this study
   *
   * @param {Number} userID
   * @param {Object} config
   * @returns {Promise}
   * @memberof Study
   */
  addUser (userID, config) {
    return this.constructor.api().post(`${this.id}/collaborator`, { userID }, config)
  }

  /**
   * Remove collaborator from this study
   *
   * @param {Number} userID
   * @param {Object} config
   * @returns {Object}
   * @memberof Study
   */
  async deleteUser (userID, config) {
    const response = await this.constructor.api().delete(`${this.id}/collaborator/${userID}`, {
      save: false,
      ...config
    })
    StudyUser.delete([this.id, userID])
    return response
  }

  /**
   * Set access level of collaborator
   *
   * @param {Object} { userID, level }
   * @param {Object} config
   * @returns {Promise}
   * @memberof Study
   */
  setAccessLevel ({ userID, level }, config) {
    return this.constructor.api().patch(`${this.id}/collaborator`, { userID, level }, config)
  }

  /**
   * Fetch the participation stats for this study
   *
   * @param {Object} config
   * @returns {Object}
   * @memberof Study
   */
  async fetchStats (config) {
    const result = await this.constructor.api().get(`${this.id}/stats`, {
      save: false,
      ...config
    })
    return result.response.data.data
  }

  /**
   * Dwonload the data for this study
   *
   * @param {Object} config
   * @returns {Blob}
   * @memberof Study
   */
  generateDataFile (config) {
    return this.constructor.api().get(`${this.id}/data`, config)
  }

  /**
   * Fetch participants for this study
   *
   * @param {*} config
   * @returns
   * @memberof Study
   */
  async fetchParticipants (config) {
    const reply = await this.constructor.api().get(`${this.id}/participants`, config)
    return reply.response.data.pagination
  }

  /**
   * Fetch IDs for the participants of the study
   *
   * @param {*} config
   * @returns
   * @memberof Study
   */
  async fetchParticipantIDs (config) {
    const reply = await this.constructor.api().get(`/${this.id}/participants/ids`, {
      save: false,
      ...config
    })
    return reply.response.data.data
  }

  /**
   * Assigns (or unassigns) participants from the study
   *
   * @param {Array} ids
   * @param {Object} config
   * @returns {Promise}
   * @memberof Study
   */
  assignParticipants (ids, config) {
    return this.constructor.api().post(`${this.id}/participants`, { participants: ids }, {
      save: false,
      ...config
    })
  }

  /**
   * Revokes participants from the study
   *
   * @param {Array} ids
   * @param {Object} config
   * @returns {Promise}
   * @memberof Study
   */
  async revokeParticipants (ids, config) {
    const response = await this.constructor.api().delete(`${this.id}/participants`, {
      save: false,
      params: { participants: ids },
      ...config
    })
    // Remove connections locally as well
    const participationIDs = ids.map(ptcpId => [this.id, ptcpId])
    for (const key of participationIDs) {
      Participation.delete(key)
    }
    return response
  }

  /**
   * Gets participation stats for this study
   *
   * @param {*} config
   * @returns
   * @memberof Study
   */
  async fetchParticipationStats (config) {
    const reply = await this.constructor.api().get(`${this.id}/stats`, config)
    return reply.response.data.data
  }
}
