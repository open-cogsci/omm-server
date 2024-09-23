'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class ParticipationsSchema extends Schema {
  up () {
    this.create('participations', (table) => {
      table.increments()
      table.integer('participant_id').unsigned().notNullable()
      table.integer('study_id').unsigned().notNullable()
      table.integer('status_id').unsigned().notNullable().defaultTo(1) // defaults to 'pending'
      table.timestamps()

      table.foreign('participant_id').references('id').inTable('participants').onDelete('cascade')
      table.foreign('study_id').references('id').inTable('studies').onDelete('cascade')
      table.foreign('status_id').references('id').inTable('participation_statuses')
    })
  }

  down () {
    this.drop('participations')
  }
}

module.exports = ParticipationsSchema
