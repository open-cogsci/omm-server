'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class AddRepeatFieldSchema extends Schema {
  up () {
    this.table('studies', (table) => {
      table.boolean('repeat').default(false)
    })

    this.table('participations', (table) => {
      table.dropColumn('loop_count')
    })
  }

  down () {
    this.table('studies', (table) => {
      table.dropColumn('repeat')
    })

    this.table('participations', (table) => {
      table.integer('loop_count').unsigned().notNullable().defaultTo(0)
    })
  }
}

module.exports = AddRepeatFieldSchema