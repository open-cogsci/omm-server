'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class JobStatesSchema extends Schema {
  up () {
    this.create('job_states', (table) => {
      table.increments()
      table.integer('participant_id').unsigned().notNullable()
      table.integer('job_id').unsigned().notNullable()
      table.integer('state_id').unsigned().notNullable()
      table.timestamps()

      table.foreign('participant_id').references('id').inTable('participants')
      table.foreign('job_id').references('id').inTable('jobs')
      table.foreign('state_id').references('id').inTable('states')
    })
  }

  down () {
    this.drop('job_states')
  }
}

module.exports = JobStatesSchema