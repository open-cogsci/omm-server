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

const User = use('App/Models/User')

const users = [
  {
    user_type_id: 1,
    name: 'Daniel Schreij',
    email: 'dschreij@gmail.com',
    password: 'daniel',
    account_status: 'active'
  },
  {
    user_type_id: 1,
    name: 'Sebastiaan Mathôt',
    email: 's.mathot@cogsci.nl',
    password: 'sebastiaan',
    account_status: 'active'
  }
]

class UserSeeder {
  async run () {
    // Don't seed any users if there already are some.
    if (await User.getCount() === 0) {
      for (const user of users) {
        await User.create(user)
      }
    }
  }
}

module.exports = UserSeeder
