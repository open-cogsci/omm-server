'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class AddRepeatFieldSchema extends Schema {
  up () {
    this.table('studies', (table) => {
      table.boolean('repeat').default(false)
    })
  }

  down () {
    this.table('studies', (table) => {
      table.dropColumn('repeat')
    })
  }
}

module.exports = AddRepeatFieldSchema
