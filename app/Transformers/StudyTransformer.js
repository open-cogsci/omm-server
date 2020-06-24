'use strict'

const BumblebeeTransformer = use('Bumblebee/Transformer')

/**
 * StudyTransformer class
 *
 * @class StudyTransformer
 * @constructor
 */
class StudyTransformer extends BumblebeeTransformer {
  /**
   * This method is used to transform the data.
   */
  transform (model) {
    return { ...model.$attributes }
  }
}

module.exports = StudyTransformer
