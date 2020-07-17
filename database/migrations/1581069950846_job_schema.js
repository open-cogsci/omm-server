'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class JobSchema extends Schema {
  up () {
    this.create('jobs', (table) => {
      table.increments()
      table.integer('study_id').unsigned().notNullable()
      table.integer('position').unsigned()
      table.timestamps()

      table.foreign('study_id').references('id').inTable('studies')
      table.unique(['study_id', 'position'])
    })
  }

  down () {
    this.drop('jobs')
  }
}

module.exports = JobSchema
