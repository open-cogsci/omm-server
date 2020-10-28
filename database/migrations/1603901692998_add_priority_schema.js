'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class AddPrioritySchema extends Schema {
  up () {
    this.alter('participations', (table) => {
      table.integer('priority').unsigned().notNullable().defaultTo(1)
    })
  }

  down () {
    this.alter('participations', (table) => {
      table.dropColumn('priority')
    })
  }
}

module.exports = AddPrioritySchema
