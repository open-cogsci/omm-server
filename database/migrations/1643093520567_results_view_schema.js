'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class ResultsViewSchema extends Schema {
  up () {
    this.raw(`
    CREATE VIEW results_view AS
    SELECT jobs.id AS job_id, jobs.position, jobs.study_id,
        job_results.data, job_states.updated_at AS last_recording,
        job_statuses.name as status,
        participants.identifier as participant_identifier, participants.name as participant_name,
        participants.meta,
        JSON_OBJECTAGG(variables.name, job_variable.value) as trial_vars,
        study.name as study_name
    FROM jobs
    LEFT JOIN job_variable ON jobs.id = job_variable.job_id
    LEFT JOIN variables ON variables.id = job_variable.variable_id
    LEFT JOIN job_states ON jobs.id = job_states.job_id
    LEFT JOIN job_results ON jobs.study_id = job_results.study_id
    LEFT JOIN participants ON job_states.participant_id = participants.id
    LEFT JOIN job_statuses ON job_states.status_id = job_statuses.id
    LEFT JOIN studies AS study ON jobs.study_id = study.id
    WHERE job_results.data IS NOT NULL
    GROUP BY job_id, job_results.data, status, participants.id, participants.identifier, participants.meta`)
  }

  down () {
    this.raw('DROP VIEW results_view')
  }
}

module.exports = ResultsViewSchema
