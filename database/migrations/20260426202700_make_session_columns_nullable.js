'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class MakeSessionColumnsNullable extends Schema {
  up () {
    this.alter('sessions', (table) => {
      table.integer('study_id').unsigned().nullable().alter()
      table.string('participant_id').nullable().alter()
    })
  }

  down () {
    // Keep nullable since the application requires it
    this.alter('sessions', (table) => {
      table.integer('study_id').unsigned().nullable().alter()
      table.string('participant_id').nullable().alter()
    })
  }
}

module.exports = MakeSessionColumnsNullable