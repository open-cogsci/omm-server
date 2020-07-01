'use strict'

/*
|--------------------------------------------------------------------------
| EnumSeeder
|--------------------------------------------------------------------------
|
| Make use of the Factory instance to seed database with dummy data or
| make use of Lucid models directly.
|
*/

/** @type {import('@adonisjs/lucid/src/Database')} */
const Database = use('Database')

class EnumSeeder {
  async run () {
    const userTypesTbl = Database.table('user_types')
    if (await userTypesTbl.getCount() === 0) {
      await userTypesTbl.insert([
        { name: 'administrator' },
        { name: 'standard' }
      ])
    }

    const permissionsTbl = Database.table('access_permissions')
    if (await permissionsTbl.getCount() === 0) {
      await permissionsTbl.insert([
        { name: 'read' },
        { name: 'write' }
      ])
    }

    const dtypesTbl = Database.table('dtypes')
    if (await dtypesTbl.getCount() === 0) {
      await dtypesTbl.insert([
        { name: 'variable' },
        { name: 'python_code' }
      ])
    }

    const jobStatusTbl = Database.table('job_statuses')
    if (await jobStatusTbl.getCount() === 0) {
      await jobStatusTbl.insert([
        { name: 'pending' },
        { name: 'started' },
        { name: 'finished' }
      ])
    }

    const participationStatusTbl = Database.table('participation_statuses')
    if (await participationStatusTbl.getCount() === 0) {
      await participationStatusTbl.insert([
        { name: 'pending' },
        { name: 'started' },
        { name: 'finished' }
      ])
    }
  }
}

module.exports = EnumSeeder
