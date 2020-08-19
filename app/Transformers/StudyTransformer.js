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
    return ['users', 'jobs', 'variables', 'participants', 'participants_count',
      'jobs_count', 'completed_jobs_count', 'files']
  }

  transform (model) {
    return {
      ...model.toObject(),
      pivot: model.$relations?.pivot?.toObject()
    }
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

  includeFiles (study) {
    return this.collection(study.getRelated('files'), 'FileTransformer')
  }

  includeParticipantsCount (study) {
    return study.$sideLoaded.participants_count
  }

  includeJobsCount (study) {
    return study.$sideLoaded.jobs_count
  }

  includeCompletedJobsCount (study) {
    return study.$sideLoaded.completed_jobs
  }
}

module.exports = StudyTransformer
