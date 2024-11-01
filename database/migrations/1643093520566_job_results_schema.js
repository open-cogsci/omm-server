'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

/**
 * Schema for job results that most importantly store the job result data. 
 * 
 * Do not rely on the study_id, participant_id, or job_id - they are not enforced by a foreign key constraint.
 * A study, participant, or job can be deleted but the related job result data is kept.
 */
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