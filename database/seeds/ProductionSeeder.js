'use strict'

/*
|--------------------------------------------------------------------------
| ProductionSeeder
|--------------------------------------------------------------------------
|
| Make use of the Factory instance to seed database with dummy data or
| make use of Lucid models directly.
|
*/
/** @type {import('@adonisjs/lucid/src/Factory')} */
/** @type {import('@adonisjs/lucid/src/Model')} */
const User = use('App/Models/User')
const EnumSeeder = require('./1-EnumSeeder')

class ProductionSeeder {
  async run () {
    await (new EnumSeeder()).run()

    // Don't seed any users if there already are some.
    if (await User.getCount() === 0) {
      await User.create({
        user_type_id: 1,
        name: 'Admin',
        email: 'admin@admin.com',
        password: 'admin',
        account_status: 'active'
      })
    }
  }
}

module.exports = ProductionSeeder
