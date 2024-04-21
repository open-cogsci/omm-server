'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class StudyDataSchema extends Schema {
  up () {
    this.create('study_data', (table) => {
      table.increments()
      table.integer('study_id').unsigned().notNullable()
      table.json('data')
      table.timestamps()

      table.foreign('study_id').references('id').inTable('studies').onDelete('cascade')
    })
  }

  down () {
    this.drop('study_data')
  }
}

module.exports = StudyDataSchema
