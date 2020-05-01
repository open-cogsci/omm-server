'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class StudySchema extends Schema {
  up () {
    this.create('studies', (table) => {
      table.increments()
      table.string('name').notNullable()
      table.string('description')
      table.timestamps()
    })
  }

  down () {
    this.drop('studies')
  }
}

module.exports = StudySchema
