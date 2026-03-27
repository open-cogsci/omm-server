'use strict'

const ace = require('@adonisjs/ace')

module.exports = (cli, runner) => {
  runner.before(async () => {
    /*
    |--------------------------------------------------------------------------
    | Start the server
    |--------------------------------------------------------------------------
    */
    use('Adonis/Src/Server').listen(process.env.HOST, process.env.PORT)

    /*
    |--------------------------------------------------------------------------
    | Run migrations
    |--------------------------------------------------------------------------
    |
    | Automatically run migrations to create the test database schema.
    |
    */
    await ace.call('migration:run', {}, { silent: true })

    /*
    |--------------------------------------------------------------------------
    | Seed the database
    |--------------------------------------------------------------------------
    |
    | Run the regular application seeders to populate lookup/reference tables
    | (e.g. user_types, access_permissions). These are the same seeders used
    | by the main app — they run once before all tests.
    |
    */
    await ace.call('seed', {}, { silent: true })
  })

  runner.after(async () => {
    /*
    |--------------------------------------------------------------------------
    | Rollback migrations
    |--------------------------------------------------------------------------
    |
    | Clean up the test database after all tests have completed.
    |
    */
    await ace.call('migration:rollback', {}, { silent: true })

    use('Adonis/Src/Server').getInstance().close()
  })
}
