'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Job extends Model {
  study () {
    return this.belongsTo('App/Model/Study')
  }

  fields () {
    return this.manyThrough('App/Model/Study', 'jobFields')
  }

  fieldValues () {
    return this.hasMany('App/Model/JobFieldValue')
  }

  states () {
    return this.hasMany('App/Model/JobState')
  }

  results () {
    return this.hasMany('App/Model/JobResults')
  }
}

module.exports = Job
