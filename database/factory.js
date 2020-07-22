'use strict'

const sample = require('lodash/sample')

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

Factory.blueprint('App/Models/Study', (faker) => {
  const experiment = sample(['attentional-capture', 'omm-entry-point', 'omm-template'])
  const osexpPath = `/osexp/${experiment}.osexp`

  return {
    name: faker.sentence({ words: 5 }),
    description: faker.sentence({ words: 10 }),
    active: faker.bool(),
    osexp_path: osexpPath
  }
})

Factory.blueprint('App/Models/Participant', (faker) => {
  return {
    name: faker.name(),
    identifier: faker.string({ length: 8, alpha: true })
  }
})
