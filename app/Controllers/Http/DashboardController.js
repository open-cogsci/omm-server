'use strict'

const processTrend = require('../../Util/trend')

const Database = use('Database')
const JobState = use('App/Models/JobState')

class DashboardController {
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
              AND study_users.user_id = ?
              AND job_states.updated_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
        GROUP BY
          job_states.updated_at
      ) as bins
      GROUP BY
        bin, updated_at
      `, [bins, userID, days]))[0]
    const trend = processTrend(bins, ptcpTrend)
    return { data: { trend } }
  }

  async mostFrequentParticipations ({ request, auth }) {
    const limit = request.input('limit', 5)
    const data = await JobState.query()
      .select('participants.name AS participant', 'participants.identifier', 'studies.name AS study',
        'job_states.updated_at AS occurrence')
      .leftJoin('participants', 'job_states.participant_id', 'participants.id')
      .leftJoin('jobs', 'job_states.job_id', 'jobs.id')
      .leftJoin('studies', 'jobs.study_id', 'studies.id')
      .leftJoin('study_users', 'studies.id', 'study_users.study_id')
      .where('study_users.user_id', auth.user.id)
      .where('job_states.status_id', 3)
      .limit(limit)
      .orderBy('occurrence', 'DESC')
      .fetch()
    return { data }
  }
}

module.exports = DashboardController
