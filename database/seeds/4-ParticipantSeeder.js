'use strict'

const Participant = use('App/Models/Participant')

class ParticipantSeeder {
  async run () {
    if (await Participant.getCount() === 0) {
      for (let i = 0; i < 10; i++) {
        const identifier = String.fromCharCode(97 + i) // 'a', 'b', ..., 'j'
        await Participant.create({
          name: `Participant ${identifier}`,
          identifier: identifier,
          active: true
        })
      }
    }
  }
}

module.exports = ParticipantSeeder