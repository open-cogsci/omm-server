'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class JobFieldsSchema extends Schema {
  up () {
    this.create('job_fields', (table) => {
      table.increments()
      table.integer('study_id').unsigned().notNullable()
      table.integer('dtype_id').unsigned().notNullable()
      table.string('name', 50)
      table.timestamps()

      table.foreign('study_id').references('id').inTable('studies')
      table.foreign('dtype_id').references('id').inTable('dtypes')
    })
  }

  down () {
    this.drop('job_fields')
  }
}

module.exports = JobFieldsSchema
