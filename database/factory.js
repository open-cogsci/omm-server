'use strict'
/*
|--------------------------------------------------------------------------
| Factory
|--------------------------------------------------------------------------
|
| Factories are used to define blueprints for database tables or Lucid
| models. Later you can use these blueprints to seed your database
| with dummy data.
|
*/

const Factory = use('Factory')

Factory.blueprint('App/Models/User', (faker) => {
  return {
    name: faker.name(),
    email: faker.email(),
    password: faker.word({ syllables: 3 })
  }
})

Factory.blueprint('App/Models/Study', (faker) => {
  return {
    name: faker.sentence({ words: 5 }),
    description: faker.sentence({ words: 10 }),
    active: faker.bool()
  }
})

Factory.blueprint('App/Models/Participant', (faker) => {
  return {
    name: faker.name(),
    identifier: faker.string({ length: 8, alpha: true })
  }
})
