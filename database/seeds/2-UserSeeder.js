'use strict'

const User = use('App/Models/User')

class UserSeeder {
  async run () {
    if (await User.getCount() === 0) {
      await User.create({
        user_type_id: 1,
        name: 'Sebastiaan Mathôt',
        email: 's.mathot@cogsci.nl',
        password: 'sebastiaan',
        account_status: 'active'
      })
    }
  }
}

module.exports = UserSeeder
