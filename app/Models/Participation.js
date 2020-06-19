'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Participation extends Model {
  study () {
    return this.belongsTo('App/Models/Study')
  }

  participant () {
    return this.belongsTo('App/Models/Participant')
  }

  state () {
    return this.belongsTo('App/Models/ParticipationStatus')
  }
}

module.exports = Participation
