'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class DtypesSchema extends Schema {
  up () {
    this.create('dtypes', (table) => {
      table.increments()
      table.string('name', 50)
    })
  }

  down () {
    this.drop('dtypes')
  }
}

module.exports = DtypesSchema
