'use strict'

/*
|--------------------------------------------------------------------------
| ParticipantSeeder
|--------------------------------------------------------------------------
|
| Make use of the Factory instance to seed database with dummy data or
| make use of Lucid models directly.
|
*/

/** @type {import('@adonisjs/lucid/src/Factory')} */
const Factory = use('Factory')
/** @type {import('@adonisjs/lucid/src/Model')} */
const Participant = use('App/Models/Participant')

class ParticipantSeeder {
  async run () {
    // Don't seed any studies if there already are some.
    if (await Participant.getCount() === 0) {
      return Factory.model('App/Models/Participant').createMany(25)
    }
  }
}

module.exports = ParticipantSeeder
