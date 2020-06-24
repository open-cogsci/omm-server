'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class JobFieldValuesSchema extends Schema {
  up () {
    this.create('job_field_values', (table) => {
      table.integer('job_field_id').unsigned().notNullable()
      table.integer('job_id').unsigned().notNullable()
      table.text('value')
      table.timestamps()

      table.foreign('job_field_id').references('id').inTable('job_fields')
      table.foreign('job_id').references('id').inTable('jobs')
      table.primary(['job_field_id', 'job_id'])
    })
  }

  down () {
    this.drop('job_field_values')
  }
}

module.exports = JobFieldValuesSchema
