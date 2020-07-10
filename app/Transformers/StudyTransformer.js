'use strict'

const BumblebeeTransformer = use('Bumblebee/Transformer')

/**
 * StudyTransformer class
 *
 * @class StudyTransformer
 * @constructor
 */
class StudyTransformer extends BumblebeeTransformer {
  static get availableInclude () {
    return ['users', 'jobs', 'variables', 'participants', 'participants_count']
  }

  transform (model) {
    const data = { ...model.toObject() }
    if (model?.$relations?.pivot) {
      data.pivot = { ...model?.$relations?.pivot.toObject() }
    }
    return data
  }

  includeUsers (study) {
    return this.collection(study.getRelated('users'), 'UserTransformer')
  }

  includeJobs (study) {
    return this.collection(study.getRelated('jobs'), 'JobTransformer')
  }

  includeVariables (study) {
    return this.collection(study.getRelated('variables'), 'VariableTransformer')
  }

  includeParticipants (study) {
    return this.collection(study.getRelated('participants'), 'ParticipantTransformer')
  }

  includeParticipantsCount (study) {
    return study.$sideLoaded.participants_count
  }
}

module.exports = StudyTransformer
