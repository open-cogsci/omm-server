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
      ...model.toObject(),
      pivot: model.$relations.pivot
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
