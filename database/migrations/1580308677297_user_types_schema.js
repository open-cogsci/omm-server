'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class UserTypesSchema extends Schema {
  up () {
    this.create('user_types', (table) => {
      table.increments('id')
      table.string('name', 50).notNullable()
    })
  }

  down () {
    this.drop('user_types')
  }
}

module.exports = UserTypesSchema
