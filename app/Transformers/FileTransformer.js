'use strict'

const BumblebeeTransformer = use('Bumblebee/Transformer')

/**
 * FileTransformer class
 *
 * @class FileTransformer
 * @constructor
 */
class FileTransformer extends BumblebeeTransformer {
  /**
   * This method is used to transform the data.
   */
  transform (model) {
    return {
      ...model.toObject()
    }
  }
}

module.exports = FileTransformer
