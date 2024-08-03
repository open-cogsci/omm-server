'use strict'

/*
|--------------------------------------------------------------------------
| JobResultSeeder
|--------------------------------------------------------------------------
|
| Make use of the Factory instance to seed database with dummy data or
| make use of Lucid models directly.
|
*/

const Factory = use('Factory')
const JobResult = use('App/Models/JobResult')
const Study = use('App/Models/Study')

Factory.blueprint('App/Models/JobResult', async (faker) => {
  const data = {
    name: faker.name(),
    email: faker.email(),
    foo: faker.word({ syllables: 3 }),
    description: faker.sentence({ words: 10 }),
    active: faker.bool(),
    timestamp: Date.now(),
    ratio: Math.random()
  }
  return {
    data: JSON.stringify(data)
  }
})

class JobResultSeeder {
  async run () {
    // Don't seed any job results if there already are some.
    if (await JobResult.getCount() === 0) {
      const jobResults1 = await Factory.model('App/Models/JobResult').makeMany(5)
      const jobResults2 = await Factory.model('App/Models/JobResult').makeMany(7)

      const study1 = await Study.findOrFail(1)
      const study2 = await Study.findOrFail(2)

      await study1.jobResults().saveMany(jobResults1)
      await study2.jobResults().saveMany(jobResults2)
    }
  }
}

module.exports = JobResultSeeder
