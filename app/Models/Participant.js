'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Participant extends Model {
  studies () {
    return this
      .belongsToMany('App/Models/Study')
      .pivotModel('App/Models/Participation')
  }

  jobs () {
    return this
      .belongsToMany('App/Models/Job')
      .pivotModel('App/Models/JobState')
  }
}

module.exports = Participant
