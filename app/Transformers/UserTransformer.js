'use strict'

const BumblebeeTransformer = use('Bumblebee/Transformer')

/**
 * UserTransformer class
 *
 * @class UserTransformer
 * @constructor
 */
class UserTransformer extends BumblebeeTransformer {
  static get defaultInclude () {
    return ['user_type']
  }

  static get availableInclude () {
    return ['studies']
  }

  /**
   * This method is used to transform the data.
   */
  transform (user) {
    return {
      ...user.toObject()
    }
  }

  transformWithStudiesCount (participant) {
    return {
      ...this.transform(participant),
      studies_count: participant.$sideLoaded.studies_count
    }
  }

  includeStudies (user) {
    return this.collection(user.getRelated('studies'), 'StudyTransformer')
  }

  includeUserType (user) {
    return this.item(user.getRelated('userType'), userType => ({
      id: userType.id,
      name: userType.name
    }))
  }
}

module.exports = UserTransformer
