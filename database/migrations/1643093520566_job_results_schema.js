'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class JobResultSchema extends Schema {
  up () {
    this.create('job_results', (table) => {
      table.increments()
      table.integer('study_id').unsigned()
      table.integer('participant_id').unsigned()
      table.integer('job_id').unsigned()
      table.json('data')
      table.timestamps()
    })
  }

  down () {
    this.drop('job_results')
  }
}

module.exports = JobResultSchema