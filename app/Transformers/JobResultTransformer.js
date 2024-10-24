'use strict'

const BumblebeeTransformer = use('Bumblebee/Transformer')

/**
 * JobTransformer class
 *
 * @class JobTransformer
 * @constructor
 */
class JobResultTransformer extends BumblebeeTransformer {
  transform (model) {
    return {
      id: model.id,
      data: model.data
    }
  }
}

module.exports = JobResultTransformer
