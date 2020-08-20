'use strict'

const BumblebeeTransformer = use('Bumblebee/Transformer')

/**
 * UserTransformer class
 *
 * @class UserTransformer
 * @constructor
 */
class UserTransformer extends BumblebeeTransformer {
  static get availableInclude () {
    return ['studies', 'user_type', 'studies_count']
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

  includeStudiesCount (model) {
    return model.$sideLoaded.studies_count
  }

  includeStudies (model) {
    return this.collection(model.getRelated('studies'), 'StudyTransformer')
  }

  includeStudiesWithParticipantCount (model) {
    return this.collection(model.getRelated('studies'), 'StudyTransformer.withParticipantsCount')
  }

  includeUserType (model) {
    return this.item(model.getRelated('userType'), userType => ({
      id: userType.id,
      name: userType.name
    }))
  }
}

module.exports = UserTransformer
