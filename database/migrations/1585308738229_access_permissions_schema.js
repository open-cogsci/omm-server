'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class AccessPermissionsSchema extends Schema {
  up () {
    this.create('access_permissions', (table) => {
      table.increments()
      table.string('name', 25)
      table.timestamps()
    })
  }

  down () {
    this.drop('access_permissions')
  }
}

module.exports = AccessPermissionsSchema
