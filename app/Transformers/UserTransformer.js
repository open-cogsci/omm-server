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
  transform (model) {
    const data = { ...model.toObject() }
    if (model?.$relations?.pivot) {
      data.pivot = { ...model?.$relations?.pivot.toObject() }
    }
    return data
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

  includeStudiesWithParticipantCount (user) {
    return this.collection(user.getRelated('studies'), 'StudyTransformer.withParticipantsCount')
  }

  includeUserType (user) {
    return this.item(user.getRelated('userType'), userType => ({
      id: userType.id,
      name: userType.name
    }))
  }
}

module.exports = UserTransformer
