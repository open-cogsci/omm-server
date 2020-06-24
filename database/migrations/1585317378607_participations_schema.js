'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class ParticipationsSchema extends Schema {
  up () {
    this.create('participations', (table) => {
      table.increments()
      table.integer('participant_id').unsigned().notNullable()
      table.integer('study_id').unsigned().notNullable()
      table.integer('status_id').unsigned().notNullable()
      table.timestamps()

      table.foreign('participant_id').references('id').inTable('participants')
      table.foreign('study_id').references('id').inTable('studies')
      table.foreign('status_id').references('id').inTable('participation_statuses')
    })
  }

  down () {
    this.drop('study_states')
  }
}

module.exports = ParticipationsSchema
