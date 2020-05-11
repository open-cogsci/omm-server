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

const Factory = use('Factory')
const Study = use('App/Models/Study')
const User = use('App/Models/User')

class StudySeeder {
  async run () {
    // Don't seed any users if there already are some.
    if (await Study.getCount() !== 0) { return }

    const daniel = await User.findOrFail(1)
    let studies = await Factory.model('App/Models/Study').makeMany(6)
    await daniel.studies().saveMany(studies)

    const sebastiaan = await User.findOrFail(2)
    studies = await Factory.model('App/Models/Study').makeMany(6)
    await sebastiaan.studies().saveMany(studies)
  }
}

module.exports = StudySeeder
