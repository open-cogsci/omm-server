'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class JobStatesSchema extends Schema {
  up () {
    this.create('job_states', (table) => {
      table.integer('participant_id').unsigned().notNullable()
      table.integer('job_id').unsigned().notNullable()
      table.integer('status_id').unsigned().notNullable().defaultTo(1)
      table.specificType('data', 'json')
      table.timestamps()

      table.foreign('participant_id').references('id').inTable('participants').onDelete('cascade')
      table.foreign('job_id').references('id').inTable('jobs').onDelete('cascade')
      table.foreign('status_id').references('id').inTable('job_statuses')

      table.primary(['participant_id', 'job_id'])
    })
  }

  down () {
    this.drop('job_states')
  }
}

module.exports = JobStatesSchema
