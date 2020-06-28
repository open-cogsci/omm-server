'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class JobStatusesSchema extends Schema {
  up () {
    this.create('job_statuses', (table) => {
      table.increments()
      table.string('name', 100).unique()
    })
  }

  down () {
    this.drop('job_statuses')
  }
}

module.exports = JobStatusesSchema
