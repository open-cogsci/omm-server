'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class ResultsSchema extends Schema {
  up () {
    this.create('results', (table) => {
      table.increments()
      table.integer('job_id').unsigned().notNullable()
      table.timestamps()
    })
  }

  down () {
    this.drop('results')
  }
}

module.exports = ResultsSchema
