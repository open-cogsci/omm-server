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
    return ['jobs', 'variables', 'participants']
  }

  transform (model) {
    return { ...model.toObject() }
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
}

module.exports = StudyTransformer
