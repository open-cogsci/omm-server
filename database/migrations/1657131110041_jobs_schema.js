'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class AddIndicesSchema extends Schema {
  up () {
    this.table('jobs', (table) => {
      table.index('position')
    })
  }

  down () {
    this.table('jobs', (table) => {
      table.dropIndex('position')
    })
  }
}

module.exports = AddIndicesSchema
