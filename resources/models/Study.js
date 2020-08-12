import { Model } from '@vuex-orm/core'
import keyBy from 'lodash/keyBy'
import User from './User'
import StudyUser from './StudyUser'
import Job from './Job'
import Variable from './Variable'
import StudyFile from './StudyFile'

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
      users: this.belongsToMany(User, StudyUser, 'study_id', 'user_id'),
      jobs: this.hasMany(Job, 'study_id'),
      variables: this.hasMany(Variable, 'study_id'),
      files: this.hasMany(StudyFile, 'study_id')
    }
  }

  static fetch (config) {
    return this.api().get('', config)
  }

  static async fetchById (id, config) {
    return await this.api().get(id, {
      dataTransformer: jobTransformer,
      ...config
    })
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

  toggleArchived (config) {
    return this.constructor.api().patch(`/${this.id}/archive`, config)
  }

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
   * @param {*} config
   * @returns Promise
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

  addUser (userID) {
    return new Promise((resolve, reject) => {
      setTimeout(() => resolve(userID), 2000)
    })
  }
}
