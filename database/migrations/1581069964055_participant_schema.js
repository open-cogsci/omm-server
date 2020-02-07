'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class ParticipantSchema extends Schema {
  up () {
    this.create('participants', (table) => {
      table.increments()
      table.timestamps()
    })
  }

  down () {
    this.drop('participants')
  }
}

module.exports = ParticipantSchema
