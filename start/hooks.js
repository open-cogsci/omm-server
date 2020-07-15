const { hooks } = require('@adonisjs/ignitor')

hooks.before.providersBooted(() => {
  const Validator = use('Validator')
  const Database = use('Database')

  const existsFn = async (data, field, message, args, get) => {
    const value = get(data, field)
    if (!value) {
      /**
         * skip validation if value is not defined. `required` rule
         * should take care of it.
        */
      return
    }

    // Check if the value 'column' exists in 'table'.
    // Only where 'constraintField' has 'constraintValue' (if indicated)

    const [table, column, constraintField, constraintValue] = args
    const query = Database.table(table).where(column, value)

    if (!!constraintField && !!constraintValue) {
      query.where(constraintField, constraintValue)
    }

    const row = await query.first()

    if (!row) {
      throw message
    }
  }
  Validator.extend('exists', existsFn)
})
