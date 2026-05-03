'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class AddLoopFieldsSchema extends Schema {
  up () {
    this.table('studies', (table) => {
      table.boolean('loop_enabled').default(false)
    })
    
    this.table('participations', (table) => {
      table.integer('loop_count').unsigned().notNullable().defaultTo(0)
    })
  }

  down () {
    this.table('studies', (table) => {
      table.dropColumn('loop_enabled')
    })
    
    this.table('participations', (table) => {
      table.dropColumn('loop_count')
    })
  }
}

module.exports = AddLoopFieldsSchema
