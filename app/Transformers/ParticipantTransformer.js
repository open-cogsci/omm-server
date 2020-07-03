'use strict'

const BumblebeeTransformer = use('Bumblebee/Transformer')

/**
 * ParticipantTransformer class
 *
 * @class ParticipantTransformer
 * @constructor
 */
class ParticipantTransformer extends BumblebeeTransformer {
  static get availableInclude () {
    return ['jobs', 'studies']
  }

  transform (participant) {
    return {
      ...participant.toObject()
    }
  }

  transformWithStudiesCount (participant) {
    return {
      ...this.transform(participant),
      studies_count: participant.$sideLoaded.studies_count
    }
  }

  includeJobs (participant) {
    return this.collection(participant.getRelated('jobs'), 'JobTransformer')
  }

  includeStudies (participant) {
    return this.collection(participant.getRelated('studies'), 'StudyTransformer')
  }
}

module.exports = ParticipantTransformer
