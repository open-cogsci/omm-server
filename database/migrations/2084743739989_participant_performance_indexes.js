'use strict'

const Schema = use('Schema')

class ParticipantPerformanceIndexesSchema extends Schema {
  up () {
    this.table('participations', (table) => {
      // Used when fetching participants belonging to one study.
      table.index(
        ['study_id', 'participant_id'],
        'participations_study_participant_idx'
      )

      // Used when calculating queue positions.
      table.index(
        ['participant_id', 'status_id', 'priority', 'study_id'],
        'participations_queue_idx'
      )
    })

    this.table('job_results', (table) => {
      // Used when counting participant results in a study.
      table.index(
        ['study_id', 'participant_id'],
        'job_results_study_participant_idx'
      )
    })
  }

  down () {
    /*
     * MySQL may be using our composite indexes to support
     * the existing foreign keys.
     *
     * Before removing the performance indexes, create simple
     * replacement indexes for those foreign-key columns.
     */
    this.table('participations', (table) => {
      table.index(
        ['study_id'],
        'participations_study_id_rollback_idx'
      )

      table.index(
        ['participant_id'],
        'participations_participant_id_rollback_idx'
      )
    })

    /*
     * Now the composite performance indexes can be removed
     * without breaking foreign-key requirements.
     */
    this.table('participations', (table) => {
      table.dropIndex(
        ['study_id', 'participant_id'],
        'participations_study_participant_idx'
      )

      table.dropIndex(
        ['participant_id', 'status_id', 'priority', 'study_id'],
        'participations_queue_idx'
      )
    })

    this.table('job_results', (table) => {
      table.dropIndex(
        ['study_id', 'participant_id'],
        'job_results_study_participant_idx'
      )
    })
  }
}

module.exports = ParticipantPerformanceIndexesSchema