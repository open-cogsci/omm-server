'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class FileSchema extends Schema {
  up () {
    this.create('files', (table) => {
      table.increments()
      table.integer('study_id').unsigned().notNullable()
        .references('id').inTable('studies').onDelete('cascade')
      table.string('path').notNullable()
      table.string('filename').notNullable()
      table.string('type').notNullable()
      table.integer('size').default(0)
      table.timestamps()
    })
  }

  down () {
    this.drop('files')
  }
}

module.exports = FileSchema
