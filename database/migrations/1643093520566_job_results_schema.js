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

      table.foreign('study_id').references('id').inTable('studies')
      table.foreign('participant_id').references('id').inTable('participants')
      table.foreign('job_id').references('id').inTable('jobs')
    })
  }

  down () {
    this.drop('job_results')
  }
}

module.exports = JobResultSchema