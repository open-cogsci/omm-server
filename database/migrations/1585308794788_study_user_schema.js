'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class StudyUserSchema extends Schema {
  up () {
    this.create('study_users', (table) => {
      table.integer('user_id').unsigned().notNullable()
      table.integer('study_id').unsigned().notNullable()
      table.integer('access_permission_id').unsigned().notNullable().defaultTo(1)
      table.boolean('is_owner').notNullable().defaultTo(false)
      table.timestamps()

      table.foreign('user_id').references('id').inTable('users').onDelete('cascade')
      table.foreign('study_id').references('id').inTable('studies').onDelete('cascade')
      table.foreign('access_permission_id').references('id').inTable('access_permissions')

      table.primary(['user_id', 'study_id'])
    })
  }

  down () {
    this.drop('study_users')
  }
}

module.exports = StudyUserSchema
