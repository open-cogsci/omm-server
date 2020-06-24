'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class JobField extends Model {
  study () {
    return this.belongsTo('App/Model/Study')
  }

  dtype () {
    return this.belongsTo('App/Model/Dtype')
  }

  values () {
    return this.belongsTo('App/Model/Dtype')
  }
}

module.exports = JobField
