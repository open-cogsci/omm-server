'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Session extends Model {
  study () {
    return this.belongsTo('App/Models/Study')
  }

  participant () {
    return this.belongsTo('App/Models/Participant')
  }
}

module.exports = Session
