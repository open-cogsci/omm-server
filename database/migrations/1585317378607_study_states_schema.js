'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class StudyStatesSchema extends Schema {
  up () {
    this.create('study_states', (table) => {
      table.increments()
      table.integer('participant_id').unsigned().notNullable()
      table.integer('study_id').unsigned().notNullable()
      table.integer('state_id').unsigned().notNullable()
      table.timestamps()

      table.foreign('participant_id').references('id').inTable('participants')
      table.foreign('study_id').references('id').inTable('studies')
      table.foreign('state_id').references('id').inTable('states')
    })
  }

  down () {
    this.drop('study_states')
  }
}

module.exports = StudyStatesSchema
