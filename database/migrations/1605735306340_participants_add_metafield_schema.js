'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class ParticipantsAddMetafieldSchema extends Schema {
  up () {
    this.alter('participants', (table) => {
      table.json('meta')
    })
  }

  down () {
    this.alter('participants', (table) => {
      table.dropColumn('meta')
    })
  }
}

module.exports = ParticipantsAddMetafieldSchema
