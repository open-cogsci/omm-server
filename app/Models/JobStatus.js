'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class JobStatus extends Model {
  jobStates () {
    return this.hasMany('App/Models/JobState')
  }
}

module.exports = JobStatus
