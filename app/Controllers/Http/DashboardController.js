'use strict'

const processTrend = require('../../Util/trend')

const Database = use('Database')
const JobState = use('App/Models/JobState')

class DashboardController {
  /**
   * Gets the trend of participations over the period of <days>
   *
   * @param {*} { request, auth }
   * @return {*}
   * @memberof DashboardController
   */
  async participationTrend ({ request, auth }) {
    const days = request.input('days', 7)
    const bins = request.input('bins', 20)
    const userID = auth.user.id

    const ptcpTrend = (await Database.raw(`
      SELECT
        SUM(c) AS amount,
          bin,
          updated_at
      FROM (
        SELECT
          job_states.updated_at,
          count(*) AS c,
          FLOOR(
            PERCENT_RANK() OVER (
              ORDER BY job_states.updated_at ASC
            ) * ?
          ) as bin
        FROM
          job_states
        LEFT JOIN
          jobs ON job_states.job_id = jobs.id
          LEFT JOIN
          studies ON jobs.study_id = studies.id
          LEFT JOIN
          study_users ON studies.id = study_users.study_id
        WHERE
          status_id = 3
          AND studies.active = 1
          AND study_users.user_id = ?
          AND job_states.updated_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
        GROUP BY
          job_states.updated_at
      ) as bins
      GROUP BY
        bin, updated_at
      `, [bins, userID, days]))[0]
    const data = processTrend(bins, ptcpTrend)
    return { data }
  }

  /**
   * Gets the most recent participations (per unique participant)
   *
   * @param {*} { request, auth }
   * @return {*}
   * @memberof DashboardController
   */
  async mostRecentParticipations ({ request, auth }) {
    const limit = request.input('limit', 5)
    const data = await JobState.query()
      .select('participants.name AS participant',
        'participants.identifier',
        'studies.name AS study',
        Database.raw('MAX(job_states.updated_at) AS occurrence'))
      .leftJoin('participants', 'job_states.participant_id', 'participants.id')
      .leftJoin('jobs', 'job_states.job_id', 'jobs.id')
      .leftJoin('studies', 'jobs.study_id', 'studies.id')
      .leftJoin('study_users', 'studies.id', 'study_users.study_id')
      .where('study_users.user_id', auth.user.id)
      .where('job_states.status_id', 3)
      .where('studies.active', 1)
      .groupByRaw('identifier, participant, study')
      .orderBy('occurrence', 'desc')
      .limit(limit)
      .fetch()
    return { data }
  }

  /**
   * Gets the most active studies
   *
   * @param {*} { request, auth }
   * @return {*}
   * @memberof DashboardController
   */
  async mostActiveStudies ({ request, auth }) {
    const limit = request.input('limit', 5)
    const period = request.input('period', 7)
    const data = await JobState.query()
      .select(
        Database.raw('COUNT(*) as participations'),
        'studies.id',
        'studies.name'
      )
      .leftJoin('jobs', 'job_states.job_id', 'jobs.id')
      .leftJoin('studies', 'jobs.study_id', 'studies.id')
      .leftJoin('study_users', 'studies.id', 'study_users.study_id')
      .where('study_users.user_id', auth.user.id)
      .where('studies.active', 1)
      .whereRaw('job_states.updated_at >= DATE_SUB(NOW(), INTERVAL ? DAY)', [period])
      .whereNot('job_states.status_id', 1)
      .groupByRaw('studies.name, studies.id')
      .limit(limit)
      .fetch()
    return { data }
  }

  /**
   * Gets the most active participants over all studies, thus also not from the current user
   *
   * @param {*} { request }
   * @return {*}
   * @memberof DashboardController
   */
  async mostActiveParticipants ({ request }) {
    const limit = request.input('limit', 5)
    const period = request.input('period', 7)
    const data = await JobState.query()
      .select('participants.name',
        'participants.identifier',
        Database.raw('COUNT(*) as participations')
      )
      .leftJoin('participants', 'job_states.participant_id', 'participants.id')
      .whereRaw('job_states.updated_at >= DATE_SUB(NOW(), INTERVAL ? DAY)', [period])
      .whereNot('job_states.status_id', 1)
      .groupByRaw('name, identifier')
      .limit(limit)
      .fetch()
    return { data }
  }
}

module.exports = DashboardController
