'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class StatesSchema extends Schema {
  up () {
    this.create('states', (table) => {
      table.increments()
      table.string('label', 100).unique()
      table.timestamps()
    })
  }

  down () {
    this.drop('states')
  }
}

module.exports = StatesSchema
