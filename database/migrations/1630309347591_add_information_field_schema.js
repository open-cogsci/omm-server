'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class AddInformationFieldSchema extends Schema {
  up () {
    this.table('studies', (table) => {
      table.text('information')
    })
  }

  down () {
    this.table('studies', (table) => {
      table.dropColumn('information')
    })
  }
}

module.exports = AddInformationFieldSchema
