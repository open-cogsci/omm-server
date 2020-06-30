'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class JobFieldValuesSchema extends Schema {
  up () {
    this.create('job_variable', (table) => {
      table.integer('variable_id').unsigned().notNullable()
      table.integer('job_id').unsigned().notNullable()
      table.text('value')
      table.timestamps()

      table.foreign('variable_id').references('id').inTable('variables')
      table.foreign('job_id').references('id').inTable('jobs')
      table.primary(['variable_id', 'job_id'])
    })
  }

  down () {
    this.drop('job_variable')
  }
}

module.exports = JobFieldValuesSchema
