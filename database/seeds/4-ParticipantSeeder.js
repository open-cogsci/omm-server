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

const participants = [
  {
    name: 'Boef',
    identifier: 'b',
    active: true
  },
  {
    name: 'Bunny',
    identifier: 'c',
    active: true
  }
]

class ParticipantSeeder {
  async run () {
    // Don't seed any studies if there already are some.
    if (await Participant.getCount() === 0) {
      for (const participant of participants) {
        await Participant.create(participant)
      }    
    }
  }
}

module.exports = ParticipantSeeder
