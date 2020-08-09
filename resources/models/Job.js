import { Model } from '@vuex-orm/core'
import { cloneDeep, keyBy } from 'lodash'
import Study from './Study'

import { JOBS } from '@/assets/js/endpoints'

export const jobTransformer = ({ data }) => {
  const job = data.data
  job.variables = keyBy(job.variables, 'name')
  return job
}

export default class Job extends Model {
  static entity = 'jobs'

  static apiConfig = {
    baseURL: JOBS
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

  moveTo (newPosition, config) {
    return this.constructor.api().patch(`/${this.id}/move/${newPosition}`, config)
  }

  setVariableValue (variableID, value, config) {
    // First update the local store to immediately reflect changes in the GUI
    this.constructor.update({
      where: this.id,
      data (job) {
        const varRecord = cloneDeep(Object.values(job.variables).find(variable => variable.id === variableID))
        const variablesClone = cloneDeep(job.variables)
        varRecord.pivot.value = value
        variablesClone[varRecord.name] = varRecord
        job.variables = variablesClone
      }
    })
    // Then remotely
    return this.constructor.api().patch(
      `/${this.id}`,
      {
        variable_id: variableID,
        value
      },
      {
        dataTransformer: jobTransformer,
        ...config
      }
    )
  }

  static fields () {
    return {
      id: this.number(null),
      position: this.number(''),
      study_id: this.number(null),
      created_at: this.attr(''),
      updated_at: this.attr(''),
      deleted_at: this.attr(''),
      study: this.belongsTo(Study, 'study_id'),
      variables: this.attr([])
    }
  }
}
