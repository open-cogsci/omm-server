'use strict'

/*
|--------------------------------------------------------------------------
| UserSeeder
|--------------------------------------------------------------------------
|
| Make use of the Factory instance to seed database with dummy data or
| make use of Lucid models directly.
|
*/

/** @type {import('@adonisjs/lucid/src/Factory')} */
const Database = use('Database')
const User = use('App/Models/User')

const userTypes = [
  { name: 'Administrator' },
  { name: 'Standard' }
]

const users = [
  {
    user_type_id: 1,
    name: 'Daniel Schreij',
    email: 'dschreij@gmail.com',
    password: 'daniel'
  },
  {
    user_type_id: 1,
    name: 'Sebastiaan Mathôt',
    email: 's.mathot@cogsci.nl',
    password: 'sebastiaan'
  }
]

class UserSeeder {
  async run () {
    const userTypesTbl = Database.table('user_types')
    if (await userTypesTbl.getCount() !== 0) {
      userTypesTbl.insert(userTypes)
    }

    // Don't seed any users if there already are some.
    if (await User.getCount() !== 0) { return }
    for (const user of users) {
      User.create(user)
    }
  }
}

module.exports = UserSeeder
