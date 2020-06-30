'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Variable extends Model {
  study () {
    return this.belongsTo('App/Models/Study')
  }

  dtype () {
    return this.belongsTo('App/Models/Dtype')
  }

  jobs () {
    return this
      .belongsToMany('App/Models/Job')
      .withPivot(['value'])
      .withTimestamps()
  }
}

module.exports = Variable
