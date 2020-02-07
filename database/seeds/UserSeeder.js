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

const users = [
  {
    name: 'Daniel Schreij',
    username: 'dschreij',
    email: 'dschreij@gmail.com',
    password: 'daniel'
  },
  {
    name: 'Sebastiaan Mathôt',
    username: 'smathot',
    email: 'smathot@cogsci.nl',
    password: 'sebastiaan'
  }
]

class UserSeeder {
  async run () {
    // Don't seed any users if there already are some.
    if (await User.getCount() !== 0) { return }
    for (const user of users) {
      User.create(user)
    }
  }
}

module.exports = UserSeeder
