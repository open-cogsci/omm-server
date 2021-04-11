'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class AddAlternateIdentifierSchema extends Schema {
  up () {
    this.alter('participants', (table) => {
      table.string('alternate_identifier').unique()
    })
  }

  down () {
    this.alter('participants', (table) => {
      table.dropColumn('alternate_identifier')
    })
  }
}

module.exports = AddAlternateIdentifierSchema
