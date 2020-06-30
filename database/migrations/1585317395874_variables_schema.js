'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class JobFieldsSchema extends Schema {
  up () {
    this.create('variables', (table) => {
      table.increments()
      table.integer('study_id').unsigned().notNullable()
      table.integer('dtype_id').unsigned().notNullable()
      table.string('name')
      table.timestamps()

      table.foreign('study_id').references('id').inTable('studies')
      table.foreign('dtype_id').references('id').inTable('dtypes')
    })
  }

  down () {
    this.drop('variables')
  }
}

module.exports = JobFieldsSchema
