'use strict'

const BumblebeeTransformer = use('Bumblebee/Transformer')

/**
 * JobTransformer class
 *
 * @class JobTransformer
 * @constructor
 */
class JobTransformer extends BumblebeeTransformer {
  static get defaultInclude () {
    return ['variables']
  }

  transform (model) {
    return { ...model.toObject() }
  }

  includeVariables (job) {
    return this.collection(job.getRelated('variables'), 'VariableTransformer')
  }
}

module.exports = JobTransformer
