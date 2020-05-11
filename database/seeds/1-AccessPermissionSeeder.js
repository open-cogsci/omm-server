'use strict'

/*
|--------------------------------------------------------------------------
| AccessPermissionSeeder
|--------------------------------------------------------------------------
|
| Make use of the Factory instance to seed database with dummy data or
| make use of Lucid models directly.
|
*/

/** @type {import('@adonisjs/lucid/src/Database')} */
const Database = use('Database')

const permissions = [
  { name: 'read' },
  { name: 'write' }
]

class AccessPermissionSeeder {
  async run () {
    const permissionsTbl = Database.table('access_permissions')
    if (await permissionsTbl.getCount() !== 0) {
      permissionsTbl.insert(permissions)
    }
  }
}

module.exports = AccessPermissionSeeder
