'use strict'

const BumblebeeTransformer = use('Bumblebee/Transformer')

/**
 * VariableTransformer class
 *
 * @class VariableTransformer
 * @constructor
 */
class VariableTransformer extends BumblebeeTransformer {
  // static get defaultInclude () {
  //   return ['dtype']
  // }

  /**
   * This method is used to transform the data.
   */
  transform (model) {
    const dtype = model.getRelated('dtype')

    return {
      id: model.id,
      name: model.name,
      dtype: dtype.name,
      // value: model.pivot.value,
      created_at: model.created_at,
      updated_at: model.updated_at
    }
  }

  // includeDtype (variable) {
  //   return this.item(variable.getRelated('dtype'), dtype => ({
  //     name: dtype.name
  //   }))
  // }
}

module.exports = VariableTransformer
