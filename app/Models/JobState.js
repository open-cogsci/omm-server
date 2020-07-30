'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class JobState extends Model {
  job () {
    return this.belongsTo('App/Models/Job')
  }

  participant () {
    return this.belongsTo('App/Models/Participant')
  }

  status () {
    return this.belongsTo('App/Models/JobStatus', 'status_id')
  }
}

module.exports = JobState
