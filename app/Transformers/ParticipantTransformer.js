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
    return ['jobs', 'studies', 'studies_count', 'completed_jobs_count']
  }

  transform (model) {
    return {
      ...model.toObject(),
      pivot: model.$relations.pivot
    }
  }

  transformPaginatedUnderStudy (model) {
    const data = {
      ...this.transform(model),
      pivot: model.$relations?.studies?.rows[0].$relations.pivot.toObject()
    }
    if (model.$sideLoaded.completed_jobs) {
      data.pivot.completed_jobs_count = model.$sideLoaded.completed_jobs
    }
    return data
  }

  includeJobs (model) {
    return this.collection(model.getRelated('jobs'), 'JobTransformer')
  }

  includeStudies (model) {
    return this.collection(model.getRelated('studies'), 'StudyTransformer')
  }

  includeStudiesCount (model) {
    return model.$sideLoaded.studies_count
  }

  includeCompletedJobsCount (model) {
    return model.$sideLoaded.completed_jobs
  }
}

module.exports = ParticipantTransformer
