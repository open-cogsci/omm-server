'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class StudyData extends Model {
  study () {
    return this.belongsTo('App/Models/Study')
  }
}
module.exports = StudyData
