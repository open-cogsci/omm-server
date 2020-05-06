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

const Study = use('App/Models/Study')

const studies = [
  {
    name: 'Study 1',
    description: 'Something involving monkeys'
  },
  {
    name: 'Study 2',
    description: 'Laborum ipsum ex reprehenderit dolore consequat amet ullamco.'
  },
  {
    name: 'Study 3',
    description: 'Consequat nulla ex ullamco voluptate esse voluptate officia.'
  },
  {
    name: 'Study 5',
    description: 'Something involving monkeys',
    active: false
  },
  {
    name: 'Study 6',
    description: 'Laborum ipsum ex reprehenderit dolore consequat amet ullamco.',
    active: false
  },
  {
    name: 'Study 7',
    description: 'Consequat nulla ex ullamco voluptate esse voluptate officia.',
    active: false
  }
]

class StudySeeder {
  async run () {
    // Don't seed any users if there already are some.
    if (await Study.getCount() !== 0) { return }
    for (const study of studies) {
      Study.create(study)
    }
  }
}

module.exports = StudySeeder
