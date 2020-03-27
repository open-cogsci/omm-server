'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class JobResultsSchema extends Schema {
  up () {
    this.create('job_results', (table) => {
      table.increments()
      table.integer('job_id').unsigned().notNullable()
      table.integer('participant_id').unsigned().notNullable()
      table.json('data')
      table.timestamps()

      table.foreign('job_id').references('id').inTable('jobs')
      table.foreign('participant_id').references('id').inTable('participants')
    })
  }

  down () {
    this.drop('job_results')
  }
}

module.exports = JobResultsSchema
