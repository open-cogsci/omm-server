'use strict'

const BumblebeeTransformer = use('Bumblebee/Transformer')

/**
 * VariableTransformer class
 *
 * @class VariableTransformer
 * @constructor
 */
class VariableTransformer extends BumblebeeTransformer {
  static get defaultInclude () {
    return ['dtype']
  }

  transform (model) {
    return {
      id: model.id,
      name: model.name,
      value: model.pivot_value,
      created_at: model.created_at,
      updated_at: model.updated_at
    }
  }

  includeDtype (variable) {
    return this.item(variable.getRelated('dtype'), dtype => ({
      id: dtype.id,
      name: dtype.name
    }))
  }
}

module.exports = VariableTransformer
