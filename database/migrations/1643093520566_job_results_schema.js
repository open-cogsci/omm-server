'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class JobResultSchema extends Schema {
  up () {
    this.create('job_results', (table) => {
      table.increments()
      table.integer('study_id').unsigned().notNullable()
      // table.integer('participant_id').unsigned().notNullable()
      table.json('data')
      table.timestamps()

      // table.foreign('participant_id').references('id').inTable('participants').onDelete('cascade')
      table.foreign('study_id').references('id').inTable('studies').onDelete('cascade')
    })
  }

  down () {
    this.drop('job_results')
  }
}

module.exports = JobResultSchema