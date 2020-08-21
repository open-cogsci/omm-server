'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class UserSchema extends Schema {
  up () {
    this.create('users', (table) => {
      table.increments()
      table.integer('user_type_id').notNullable().unsigned().default(2)
      table.string('name').notNullable()
      table.string('email', 255).notNullable().unique()
      table.string('password', 60).notNullable()
      table.string('account_status').notNullable().default('pending')
      table.datetime('last_login')
      table.timestamps()

      table.foreign('user_type_id').references('id').inTable('user_types')
    })
  }

  down () {
    this.drop('users')
  }
}

module.exports = UserSchema
