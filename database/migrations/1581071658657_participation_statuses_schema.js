'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class ParticipationStatusesSchema extends Schema {
  up () {
    this.create('parcipation_statuses', (table) => {
      table.increments()
      table.string('label', 100).unique()
    })
  }

  down () {
    this.drop('parcipation_statuses')
  }
}

module.exports = ParticipationStatusesSchema
