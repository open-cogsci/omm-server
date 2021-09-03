'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class SessionSchema extends Schema {
  up () {
    this.create('sessions', (table) => {
      table.integer('study_id').unsigned()
      table.integer('participant_id').unsigned()
      table.json('data').notNullable()
      table.timestamps()

      table.foreign('study_id').references('id').inTable('studies').onDelete('cascade')
      table.foreign('participant_id').references('id').inTable('participants').onDelete('cascade')
      table.unique(['study_id', 'participant_id'])
    })
  }

  down () {
    this.drop('sessions')
  }
}

module.exports = SessionSchema
