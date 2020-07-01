'use strict'

const Participant = use('App/Models/Participant')

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

class ParticipantSeeder {
  async run () {
    // Don't seed any studies if there already are some.
    if (await Participant.getCount() === 0) {
      return Factory.model('App/Models/Participant').createMany(5)
    }
  }
}

module.exports = ParticipantSeeder
