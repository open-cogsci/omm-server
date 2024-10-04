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
    // Don't seed any job results
  }
}

module.exports = JobResultSeeder
