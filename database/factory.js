'use strict'

const fs = require('fs')
const crypto = require('crypto')
const sample = require('lodash/sample')

const algorithm = 'sha256'
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

/**
  Factory.blueprint('App/Models/User', (faker) => {
    return {
      username: faker.username()
    }
  })
*/

Factory.blueprint('App/Models/Study', (faker) => {
  const experiment = sample(['attentional-capture', 'omm-entry-point', 'omm-template'])
  const osexpPath = `/public/osexp/${experiment}.osexp`
  let osexpHash = 'not set'
  const shasum = crypto.createHash(algorithm)
  const s = fs.ReadStream(osexpPath)
  s.on('data', function (data) {
    shasum.update(data)
  })

  // making digest
  s.on('end', function () {
    osexpHash = shasum.digest('hex')
  })

  return {
    name: faker.sentence({ words: 5 }),
    description: faker.sentence({ words: 10 }),
    active: faker.bool(),
    osexp_path: osexpPath,
    osexp_hash: osexpHash
  }
})
