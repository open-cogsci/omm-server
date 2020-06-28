'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class ParticipationStatusesSchema extends Schema {
  up () {
    this.create('participation_statuses', (table) => {
      table.increments()
      table.string('name', 100).unique()
    })
  }

  down () {
    this.drop('participation_statuses')
  }
}

module.exports = ParticipationStatusesSchema
