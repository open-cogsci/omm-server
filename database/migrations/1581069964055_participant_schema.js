'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class ParticipantSchema extends Schema {
  up () {
    this.create('participants', (table) => {
      table.increments()
      table.string('name').notNullable()
      table.string('rfid').notNullable().unique()
      table.boolean('active').notNullable().defaultTo(true)
      table.timestamps()
    })
  }

  down () {
    this.drop('participants')
  }
}

module.exports = ParticipantSchema
